document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        packet1: document.getElementById('packet1'),
        packet2: document.getElementById('packet2'),
        nodes: {
            pc1: document.getElementById('node-pc1'),
            pc2: document.getElementById('node-pc2'),
            wifi: document.getElementById('node-wifi'),
            onu: document.getElementById('node-onu'),
            server: document.getElementById('node-server')
        },
        naptRow1: document.getElementById('napt-row-1'),
        naptRow2: document.getElementById('napt-row-2'),
        ipSource: document.getElementById('ip-source'),
        ipDest: document.getElementById('ip-dest'),
        macSource: document.getElementById('mac-source'),
        macDest: document.getElementById('mac-dest'),
        portSource: document.getElementById('port-source'),
        portDest: document.getElementById('port-dest'),
        description: document.getElementById('description'),
        btnPc1: document.getElementById('btn-pc1'),
        btnPc2: document.getElementById('btn-pc2'),
        btnStop: document.getElementById('btn-stop'),
    };

    let animationFrameId;
    let isAnimating = false;
    let positions = {};

    // ▼▼▼ アニメーションのステップを往復分(4段階)に拡張 ▼▼▼
    const steps = {
        pc1: [
            { macSource: "PC1", macDest: "Wi-Fi", ipSource: "192.168.1.1", ipDest: "Webサーバ", portSource: "50000", portDest: "80", desc: "PC1からWi-Fiルータへ向かいます。", naptHighlight: false },
            { macSource: "Wi-Fi", macDest: "Webサーバ", ipSource: "1.2.3.4 (グローバル)", ipDest: "Webサーバ", portSource: "51000", portDest: "80", desc: "ルータでNAPT変換され、Webサーバへ向かいます。", naptHighlight: true },
            { macSource: "Webサーバ", macDest: "Wi-Fi", ipSource: "Webサーバ", ipDest: "1.2.3.4 (グローバル)", portSource: "80", portDest: "51000", desc: "サーバからの返信がルータに到着します。", naptHighlight: true },
            { macSource: "Wi-Fi", macDest: "PC1", ipSource: "Webサーバ", ipDest: "192.168.1.1", portSource: "80", portDest: "50000", desc: "ルータがNAPTテーブルを元に宛先をPC1に変換し、パケットを届けます。", naptHighlight: false }
        ],
        pc2: [
            { macSource: "PC2", macDest: "Wi-Fi", ipSource: "192.168.1.2", ipDest: "Webサーバ", portSource: "50000", portDest: "80", desc: "PC2からWi-Fiルータへ向かいます。", naptHighlight: false },
            { macSource: "Wi-Fi", macDest: "Webサーバ", ipSource: "1.2.3.4 (グローバル)", ipDest: "Webサーバ", portSource: "52000", portDest: "80", desc: "ルータでNAPT変換され、Webサーバへ向かいます。", naptHighlight: true },
            { macSource: "Webサーバ", macDest: "Wi-Fi", ipSource: "Webサーバ", ipDest: "1.2.3.4 (グローバル)", portSource: "80", portDest: "52000", desc: "サーバからの返信がルータに到着します。", naptHighlight: true },
            { macSource: "Wi-Fi", macDest: "PC2", ipSource: "Webサーバ", ipDest: "192.168.1.2", portSource: "80", portDest: "50000", desc: "ルータがNAPTテーブルを元に宛先をPC2に変換し、パケットを届けます。", naptHighlight: false }
        ]
    };

    const updatePositions = () => {
        Object.keys(elements.nodes).forEach(key => {
            const el = elements.nodes[key];
            if (el) {
                const rect = el.getBoundingClientRect();
                const stageRect = el.closest('.animation-stage').getBoundingClientRect();
                positions[key] = {
                    x: rect.left - stageRect.left + rect.width / 2,
                    y: rect.top - stageRect.top + rect.height / 2
                };
            }
        });
    };

    const renderState = (state, naptRow) => {
        if (!state) {
            elements.ipSource.textContent = "-";
            elements.ipDest.textContent = "-";
            elements.macSource.textContent = "-";
            elements.macDest.textContent = "-";
            elements.portSource.textContent = "-";
            elements.portDest.textContent = "-";
            elements.description.textContent = "再生ボタンを押してください。";
            elements.naptRow1.classList.remove('highlight');
            elements.naptRow2.classList.remove('highlight');
            return;
        }
        elements.ipSource.textContent = state.ipSource;
        elements.ipDest.textContent = state.ipDest;
        elements.macSource.textContent = state.macSource;
        elements.macDest.textContent = state.macDest;
        elements.portSource.textContent = state.portSource;
        elements.portDest.textContent = state.portDest;
        elements.description.textContent = state.desc;

        elements.naptRow1.classList.remove('highlight');
        elements.naptRow2.classList.remove('highlight');
        if (state.naptHighlight && naptRow) {
            naptRow.classList.add('highlight');
        }
    };
    
    const movePacket = (packet, startPos, endPos) => {
        return new Promise(resolve => {
            const startX = startPos.x - packet.offsetWidth / 2;
            const startY = startPos.y - packet.offsetHeight / 2;
            const endX = endPos.x - packet.offsetWidth / 2;
            const endY = endPos.y - packet.offsetHeight / 2;

            packet.style.transform = `translate(${startX}px, ${startY}px)`;
            packet.style.opacity = 1;
            
            let startTime = null;
            const duration = 2000;

            function animationLoop(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                packet.style.transform = `translate(${currentX}px, ${currentY}px)`;

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animationLoop);
                } else {
                    resolve();
                }
            }
            animationFrameId = requestAnimationFrame(animationLoop);
        });
    };

    // ▼▼▼ 往復アニメーションを実行するように拡張 ▼▼▼
    const runAnimation = async (packet, pathKeys, states, naptRow) => {
        if (isAnimating) return;
        isAnimating = true;
        toggleButtons(true);
        updatePositions();
        
        // --- 行き ---
        // 1. PC -> Wi-Fi
        renderState(states[0], naptRow);
        await movePacket(packet, positions[pathKeys[0]], positions[pathKeys[1]]);
        
        // 2. Wi-Fi -> Server
        renderState(states[1], naptRow);
        await movePacket(packet, positions[pathKeys[1]], positions[pathKeys[2]]);

        // サーバで少し待機
        await new Promise(r => setTimeout(r, 500));

        // --- 戻り ---
        // 3. Server -> Wi-Fi
        renderState(states[2], naptRow);
        await movePacket(packet, positions[pathKeys[2]], positions[pathKeys[1]]);

        // 4. Wi-Fi -> PC
        renderState(states[3], naptRow);
        await movePacket(packet, positions[pathKeys[1]], positions[pathKeys[0]]);
        
        packet.style.opacity = 0;
        isAnimating = false;
        toggleButtons(false);
    };

    const stopAnimation = () => {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
        elements.packet1.style.opacity = 0;
        elements.packet2.style.opacity = 0;
        toggleButtons(false);
        renderState(null);
    };

    const toggleButtons = (animating) => {
        elements.btnPc1.disabled = animating;
        elements.btnPc2.disabled = animating;
    };

    elements.btnPc1.addEventListener('click', () => {
        const path = ['pc1', 'wifi', 'server'];
        runAnimation(elements.packet1, path, steps.pc1, elements.naptRow1);
    });
    elements.btnPc2.addEventListener('click', () => {
        const path = ['pc2', 'wifi', 'server'];
        runAnimation(elements.packet2, path, steps.pc2, elements.naptRow2);
    });
    elements.btnStop.addEventListener('click', stopAnimation);

    window.addEventListener('load', updatePositions);
    window.addEventListener('resize', updatePositions);
    renderState(null);
});