document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        packets: [document.getElementById('packet1'), document.getElementById('packet2'), document.getElementById('packet3')],
        pcNode: document.getElementById('node-pc'),
        servers: [document.getElementById('node-server1'), document.getElementById('node-server2'), document.getElementById('node-server3')],
        pcIp: document.getElementById('pc-ip'),
        dhcpStatus: document.getElementById('dhcp-status'),
        ipSource: document.getElementById('ip-source'),
        ipDest: document.getElementById('ip-dest'),
        macSource: document.getElementById('mac-source'),
        macDest: document.getElementById('mac-dest'),
        description1: document.getElementById('description-1'),
        description2: document.getElementById('description-2'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
    };

    const dhcpSteps = [
        {
            status: "Discover",
            animationConfig: { targets: elements.packets, from: elements.pcNode, to: elements.servers },
            ipSource: "0.0.0.0", ipDest: "255.255.255.255",
            macSource: "11:..:11 (PC)", macDest: "FF:..:FF (Broadcast)",
            desc1: "PCがネットワーク上の全てのDHCPサーバに対し、「IPアドレスをください」とブロードキャストで問い合わせます。",
            desc2: "この時点では宛先が不明なため、全員に届く特別なアドレスを使います。"
        },
        {
            status: "Offer",
            animationConfig: { targets: [elements.packets[0], elements.packets[2]], from: [elements.servers[0], elements.servers[2]], to: elements.pcNode },
            onEnter: () => {
                elements.servers.forEach(s => s.classList.remove('highlight'));
                elements.servers[1].classList.add('dimmed');
                elements.servers[0].classList.add('highlight');
                elements.servers[2].classList.add('highlight');
            },
            ipSource: "サーバのIP", ipDest: "PCのMAC宛", macSource: "サーバのMAC", macDest: "11:..:11 (PC)",
            desc1: "問い合わせを受け取ったDHCPサーバが、「このIPアドレスはどうですか？」と提案を返します。",
            desc2: "今回は2台のサーバが応答しました。"
        },
        {
            status: "Request",
            animationConfig: { targets: elements.packets, from: elements.pcNode, to: elements.servers },
            onEnter: () => {
                elements.servers.forEach(s => s.classList.remove('dimmed', 'highlight'));
                elements.servers[0].classList.add('highlight');
                elements.servers[2].classList.add('dimmed');
            },
            ipSource: "0.0.0.0", ipDest: "255.255.255.255", macSource: "11:..:11 (PC)", macDest: "FF:..:FF (Broadcast)",
            desc1: "PCは一番上のサーバからの提案を選び、「そのIPアドレスを利用します」と全員に知らせます。",
            desc2: "選ばれなかったサーバ(3番目)はこの通知を見て、貸し出そうとしたIPアドレスを解放します。"
        },
        {
            status: "ACK",
            animationConfig: { targets: [elements.packets[0]], from: elements.servers[0], to: elements.pcNode },
            onEnter: () => {
                elements.servers.forEach(s => s.classList.add('dimmed'));
                elements.servers[0].classList.remove('dimmed');
                elements.servers[0].classList.add('highlight');
            },
            ipSource: "192.168.1.1 (サーバ1)", ipDest: "192.168.1.100 (PC)", macSource: "サーバ1のMAC", macDest: "11:..:11 (PC)",
            desc1: "選ばれたサーバが「了解です」と最終確認を送り、IPアドレスの貸し出しが確定します。",
            desc2: "これ以降、PCは「192.168.1.100」というIPアドレスを使います。"
        }
    ];

    let currentStep = 0;
    let isAnimating = false;

    const renderState = (stepIndex) => {
        const state = dhcpSteps[stepIndex];
        if (!state) return;

        // ▼▼▼ ここのキー指定のロジックを修正しました ▼▼▼
        ['status', 'ipSource', 'ipDest', 'macSource', 'macDest'].forEach(key => {
            const elementKey = key === 'status' ? 'dhcpStatus' : key;
            if(elements[elementKey]) {
                elements[elementKey].textContent = state[key];
            }
        });
        // ▲▲▲ 修正ここまで ▲▲▲

        elements.description1.textContent = state.desc1;
        elements.description2.textContent = state.desc2;
        
        elements.packets.forEach(p => {
            const label = p.querySelector('.packet-label') || p;
            p.style.opacity = 0;
            label.textContent = state.status;
            p.className = `packet ${state.status.toLowerCase()}`;
        });

        if (state.onEnter) state.onEnter();
        else elements.servers.forEach(s => s.classList.remove('dimmed', 'highlight'));

        elements.pcIp.textContent = (stepIndex === 3) ? "192.168.1.100" : "0.0.0.0";
        elements.btnPrev.disabled = (stepIndex === 0);
        elements.btnNext.disabled = (stepIndex === dhcpSteps.length - 1);
        elements.btnNext.textContent = elements.btnNext.disabled ? "完了" : "次へ";
    };

    const animatePackets = (config) => {
        if (isAnimating) return;
        isAnimating = true;

        let completedAnimations = 0;
        const totalAnimations = config.targets.length;

        config.targets.forEach((packet, i) => {
            const fromNode = Array.isArray(config.from) ? config.from[i] : config.from;
            const toNode = Array.isArray(config.to) ? config.to[i] : config.to;
            
            // 【重要】offsetLeft/Top を使った、よりシンプルな座標計算
            const startX = fromNode.offsetLeft + fromNode.offsetWidth / 2 - packet.offsetWidth / 2;
            const startY = fromNode.offsetTop + fromNode.offsetHeight / 2 - packet.offsetHeight / 2;
            const endX = toNode.offsetLeft + toNode.offsetWidth / 2 - packet.offsetWidth / 2;
            const endY = toNode.offsetTop + toNode.offsetHeight / 2 - packet.offsetHeight / 2;
            
            // 【重要】transformではなく、topとleftで位置を指定
            packet.style.left = `${startX}px`;
            packet.style.top = `${startY}px`;
            packet.style.opacity = 1;

            let startTime = null;
            const duration = 1500;

            function animationLoop(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;

                // 【重要】アニメーション中もtopとleftを更新
                packet.style.left = `${currentX}px`;
                packet.style.top = `${currentY}px`;

                if (progress < 1) {
                    requestAnimationFrame(animationLoop);
                } else {
                    packet.style.opacity = 0;
                    completedAnimations++;
                    if (completedAnimations === totalAnimations) {
                        isAnimating = false;
                        if (config.onComplete) config.onComplete();
                    }
                }
            }
            requestAnimationFrame(animationLoop);
        });
    };

    const handlePrev = () => {
        if (currentStep > 0 && !isAnimating) {
            currentStep--;
            renderState(currentStep);
        }
    };
    
    const handleNext = () => {
        if (currentStep < dhcpSteps.length - 1 && !isAnimating) {
            const config = dhcpSteps[currentStep].animationConfig;
            config.onComplete = () => {
                currentStep++;
                renderState(currentStep);
            };
            animatePackets(config);
        }
    };
    
    elements.btnPrev.addEventListener('click', handlePrev);
    elements.btnNext.addEventListener('click', handleNext);
    
    renderState(0);
});