document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        packet: document.getElementById('packet'),
        packetLabel: document.getElementById('packet-label'),
        nodes: {
            pc: document.getElementById('node-pc'),
            dnsLocal: document.getElementById('node-dns-local'),
            dnsRoot: document.getElementById('node-dns-root'),
            dnsJp: document.getElementById('node-dns-jp'),
            dnsGo: document.getElementById('node-dns-go'),
            dnsJma: document.getElementById('node-dns-jma'),
            dnsUk: document.getElementById('node-dns-uk'),
            dnsCo: document.getElementById('node-dns-co')
        },
        svg: document.getElementById('dns-lines-svg'),
        stepNumber: document.getElementById('step-number'),
        stepDescription: document.getElementById('step-description'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
    };

    const steps = [
        { num: '①', desc: "キャッシュDNSサーバに www.jma.go.jp のIPアドレスを問い合わせる", packetText: "問い合わせ", from: 'pc', to: 'dnsLocal' },
        { num: '②', desc: "ルートDNSサーバに「jp」を管理するDNSサーバを問い合わせる", packetText: "問い合わせ", from: 'dnsLocal', to: 'dnsRoot', highlight: 'dnsRoot' },
        { num: '②', desc: "ルートDNSサーバから「jp」DNSサーバのアドレスが返ってくる", packetText: "jpのアドレス", from: 'dnsRoot', to: 'dnsLocal' },
        { num: '③', desc: "jpDNSサーバに「go」を管理するDNSサーバを問い合わせる", packetText: "問い合わせ", from: 'dnsLocal', to: 'dnsJp', highlight: 'dnsJp' },
        { num: '③', desc: "jpDNSサーバから「go」DNSサーバのアドレスが返ってくる", packetText: "goのアドレス", from: 'dnsJp', to: 'dnsLocal' },
        { num: '④', desc: "goDNSサーバに「jma」を管理するDNSサーバを問い合わせる", packetText: "問い合わせ", from: 'dnsLocal', to: 'dnsGo', highlight: 'dnsGo' },
        { num: '④', desc: "goDNSサーバから「jma」DNSサーバのアドレスが返ってくる", packetText: "jmaのアドレス", from: 'dnsGo', to: 'dnsLocal' },
        { num: '⑤', desc: "jmaDNSサーバにホスト名「www」のIPアドレスを問い合わせる", packetText: "問い合わせ", from: 'dnsLocal', to: 'dnsJma', highlight: 'dnsJma' },
        { num: '⑤', desc: "jmaDNSサーバから www.jma.go.jp のIPアドレスが返ってくる", packetText: "IPアドレス", from: 'dnsJma', to: 'dnsLocal' },
        { num: '⑥', desc: "クライアントPCに最終的なIPアドレスを返す", packetText: "IPアドレス", from: 'dnsLocal', to: 'pc' },
    ];

    let currentStep = 0;
    let isAnimating = false;
    let positions = {};

    const updatePositions = () => {
        const stage = document.querySelector('.animation-stage');
        if (!stage) return;
        const stageRect = stage.getBoundingClientRect();
        Object.keys(elements.nodes).forEach(key => {
            const el = elements.nodes[key];
            if (el) {
                const rect = el.getBoundingClientRect();
                positions[key] = {
                    x: rect.left - stageRect.left + rect.width / 2,
                    y: rect.top - stageRect.top + rect.height / 2
                };
            }
        });
        drawDnsLines();
    };

    const drawDnsLines = () => {
        if (!elements.svg) return;
        elements.svg.innerHTML = '';
        const createLine = (fromNodeKey, toNodeKey) => {
            if (!positions[fromNodeKey] || !positions[toNodeKey]) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', positions[fromNodeKey].x);
            line.setAttribute('y1', positions[fromNodeKey].y);
            line.setAttribute('x2', positions[toNodeKey].x);
            line.setAttribute('y2', positions[toNodeKey].y);
            line.setAttribute('stroke', '#cccccc');
            line.setAttribute('stroke-width', '3');
            elements.svg.appendChild(line);
        };
        createLine('dnsRoot', 'dnsJp');
        createLine('dnsRoot', 'dnsUk');
        createLine('dnsJp', 'dnsGo');
        createLine('dnsJp', 'dnsCo');
        createLine('dnsGo', 'dnsJma');
    };
    
    const renderState = (stepIndex) => {
        const isFinished = stepIndex >= steps.length;
        const state = isFinished ? steps[steps.length - 1] : steps[stepIndex];
        
        elements.stepNumber.textContent = state.num || '①';
        elements.stepDescription.textContent = state.desc || "ボタンを押してアニメーションを開始";
        
        document.querySelectorAll('.node.highlight').forEach(n => n.classList.remove('highlight'));
        if (state.highlight) {
            elements.nodes[state.highlight].classList.add('highlight');
        }

        elements.btnNext.textContent = isFinished ? "最初から" : "次へ";
    };
    
    const movePacket = (config) => {
        return new Promise(resolve => {
            const { packet, from, to, text } = config;
            packet.textContent = text;
            const startPos = positions[from];
            const endPos = positions[to];
            
            packet.style.transform = `translate(${startPos.x - packet.offsetWidth / 2}px, ${startPos.y - packet.offsetHeight / 2}px)`;
            packet.style.opacity = 1;
            
            let startTime = null;
            const duration = 1200;

            function animationLoop(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const currentX = startPos.x + (endPos.x - startPos.x) * progress;
                const currentY = startPos.y + (endPos.y - startPos.y) * progress;
                packet.style.transform = `translate(${currentX - packet.offsetWidth / 2}px, ${currentY - packet.offsetHeight / 2}px)`;

                if (progress < 1) {
                    requestAnimationFrame(animationLoop);
                } else {
                    packet.style.opacity = 0;
                    resolve();
                }
            }
            requestAnimationFrame(animationLoop);
        });
    };

    const updateButtonStates = () => {
        elements.btnPrev.disabled = isAnimating || currentStep === 0;
        elements.btnNext.disabled = isAnimating;
    };

    const handlePrev = () => {
        if (isAnimating || currentStep === 0) return;
        currentStep--;
        renderState(currentStep);
    };
    
    const handleNext = async () => {
        if (isAnimating) return;
        
        if (currentStep >= steps.length) {
            currentStep = 0;
            renderState(currentStep);
            updateButtonStates();
            return;
        }
        
        isAnimating = true;
        updateButtonStates();
        
        const state = steps[currentStep];
        renderState(currentStep);
        
        await movePacket({
            packet: elements.packet,
            from: state.from,
            to: state.to,
            text: state.packetText
        });

        currentStep++;
        isAnimating = false;
        renderState(currentStep);
        updateButtonStates();
    };
    
    elements.btnPrev.addEventListener('click', handlePrev);
    elements.btnNext.addEventListener('click', handleNext);
    
    window.addEventListener('load', updatePositions);
    window.addEventListener('resize', updatePositions);
    renderState(0);
    updateButtonStates();
});