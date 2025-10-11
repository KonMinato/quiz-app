// --- グローバル変数 ---
const packet = document.getElementById('pkt');
const ipInfo = document.querySelector('.ip-info');
const macInfo = document.querySelector('.mac-info');
const currentStatus = document.querySelector('.current-status p');

let animationFrameId;
let currentPosition = 0;
let direction = 1;
let devicePositions = {};
let speed = 2; // 【追加】速度を保持する変数

// --- 初期化処理 ---
window.addEventListener('load', () => {
    updateDevicePositions();
    updateSpeed(); // 【追加】初回の速度を設定
    init();
});
window.addEventListener('resize', () => {
    updateDevicePositions();
    updateSpeed(); // 【追加】リサイズ時も速度を再設定
    init();
});


// --- ボタンのイベントリスナー ---
document.getElementById('btn-start').addEventListener('click', () => startAnimation(1));
document.getElementById('btn-stop').addEventListener('click', stopAnimation);
document.getElementById('btn-reverse').addEventListener('click', () => startAnimation(-1));


// --- 関数定義 ---

// 【追加】画面幅に応じて速度を更新する関数
function updateSpeed() {
    if (window.innerWidth <= 768) {
        speed = 1; // スマホ用の遅い速度
    } else {
        speed = 3; // PC用の速い速度
    }
}

// 各機器の座標を取得して保存
function updateDevicePositions() {
    ['img01', 'img02', 'img03', 'img05'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const rect = el.getBoundingClientRect();
            devicePositions[id] = {
                left: rect.left,
                right: rect.right,
                center: rect.left + rect.width / 2
            };
        }
    });
    // 初期位置を設定
    currentPosition = devicePositions['img01'].center;
    packet.style.left = `${currentPosition - packet.offsetWidth / 2}px`;
}

// アニメーションを開始
function startAnimation(newDirection) {
    stopAnimation();
    direction = newDirection;
    document.getElementById('btn-start').disabled = (direction === 1);
    document.getElementById('btn-reverse').disabled = (direction === -1);
    
    animationFrameId = requestAnimationFrame(movePacket);
}

// アニメーションを停止
function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-reverse').disabled = false;
}

// 【修正】パケットを動かすメインの関数
function movePacket() {
    // 移動 (固定値ではなくspeed変数を使う)
    currentPosition += direction * speed; 
    packet.style.left = `${currentPosition - packet.offsetWidth / 2}px`;
    
    updateExplanation();

    const startBoundary = devicePositions['img01'].center;
    const endBoundary = devicePositions['img05'].center;
    if (currentPosition >= endBoundary || currentPosition <= startBoundary) {
        stopAnimation();
    } else {
        animationFrameId = requestAnimationFrame(movePacket);
    }
}

// パケットの位置に応じて説明文を更新 (変更なし)
function updateExplanation() {
    const pos = currentPosition;
    const dev = devicePositions;

    let ipSource = "192.168.1.1 (PC)";
    let ipDest = "133.12.241.200 (Webサーバ)";
    let macSource = "";
    let macDest = "";
    let status = "";

    if (direction === -1) { [ipSource, ipDest] = [ipDest, ipSource]; }
    
    if (pos >= dev.img01.center && pos < dev.img02.center) {
        macSource = "11:..:11 (PC)";
        macDest = "22:..:22 (ルータLAN側)";
        status = "PCからWi-Fiルータへ向かっています。";
    } else if (pos >= dev.img02.center && pos < dev.img03.center) {
        macSource = "11:..:11 (PC)";
        macDest = "22:..:22 (ルータLAN側)";
        status = "Wi-Fiルータに到着。MACアドレスを書き換えます。";
    } else if (pos >= dev.img03.center && pos < dev.img05.center) {
        macSource = "33:..:33 (ルータWAN側)";
        macDest = "44:..:44 (Webサーバ)";
        status = "インターネットを経由し、Webサーバへ向かっています。";
    } else {
         macSource = "33:..:33 (ルータWAN側)";
         macDest = "44:..:44 (Webサーバ)";
         status = "Webサーバに到着しました。";
    }

    if (direction === -1) { [macSource, macDest] = [macDest, macSource]; }

    ipInfo.innerHTML = `<p>送信元IP: ${ipSource}</p><p>送信先IP: ${ipDest}</p>`;
    macInfo.innerHTML = `<p>送信元MAC: ${macSource}</p><p>送信先MAC: ${macDest}</p>`;
    document.querySelector('.current-status').innerHTML = `<p>${status}</p>`;
}


// --- Canvas描画機能 --- (変更なし)
function init() {
    const canvas = document.getElementById("canvas");
    if (!canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const img01 = document.querySelector('#img01');
    if (!img01) return;
    
    const rect1 = img01.getBoundingClientRect();
    const rect3 = document.querySelector('#img03').getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const houseTop = rect1.top - canvasRect.top - 20;
    const houseBottom = rect1.bottom - canvasRect.top + 20;
    const houseLeft = rect1.left - canvasRect.left - 20;
    const houseRight = rect3.right - canvasRect.left + 20;

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 10;
    ctx.strokeRect(houseLeft, houseTop, houseRight - houseLeft, houseBottom - houseTop);

    ctx.beginPath();
    ctx.moveTo(houseLeft - 10, houseTop);
    ctx.lineTo(houseLeft + (houseRight - houseLeft) / 2, houseTop - 100);
    ctx.lineTo(houseRight + 10, houseTop);
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

