// --- グローバル変数 ---
let draggedItem = null;

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupAccordion();
    setupModalClose();
    setupButtons();
    setupDragAndDrop();
});
window.addEventListener('load', init);
window.addEventListener('resize', init);

// --- セットアップ関数 ---
function setupAccordion() {
    let openBox = null;
    document.querySelectorAll('.box').forEach(box => {
        box.addEventListener('click', () => {
            const isOpening = !box.classList.contains('open');
            if (openBox) { openBox.classList.remove('open'); }
            if (isOpening) {
                box.classList.add('open');
                openBox = box;
            } else {
                openBox = null;
            }
            setTimeout(init, 50);
        });
    });
}

function setupModalClose() {
    document.querySelectorAll('.modal-window').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { closeModal(); }
        });
    });
}

function setupButtons() {
    document.getElementById('btn01').addEventListener('click', btn01);
    const btn02_element = document.getElementById('btn02');
    if (btn02_element) {
        btn02_element.addEventListener('click', btn02);
    }
}

function setupDragAndDrop() {
    document.querySelectorAll('[draggable="true"]').forEach(item => {
        // PC用
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        // スマホ用
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd);
    });
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

// --- D&D イベントハンドラ ---
function handleDragStart(e) {
    draggedItem = this;
    if (e.dataTransfer) { e.dataTransfer.setData('text/plain', null); }
    setTimeout(() => this.classList.add('dragging'), 0);
}
function handleDragEnd() { this.classList.remove('dragging'); }
function handleDragOver(e) { e.preventDefault(); this.classList.add('drag-over'); }
function handleDragLeave() { this.classList.remove('drag-over'); }
function handleDrop(e) {
    e.preventDefault();
    if (draggedItem && this !== draggedItem) {
        const tempSrc = this.src;
        this.src = draggedItem.src;
        draggedItem.src = tempSrc;
    }
    this.classList.remove('drag-over');
    init();
}
// --- タッチイベント用ハンドラ ---
function handleTouchStart(e) { e.preventDefault(); handleDragStart.call(this, e); }
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
    if (dropTarget && dropTarget.classList.contains('drop-zone')) {
        dropTarget.classList.add('drag-over');
    }
}
function handleTouchEnd(e) {
    handleDragEnd.call(this);
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (dropTarget && dropTarget.classList.contains('drop-zone')) {
        handleDrop.call(dropTarget, e);
    }
    document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
}

// --- 正誤判定とモーダル ---
function btn01() {
    const isPc = (id) => document.getElementById(id).src.includes("img/pc0.png");
    const isWifi = (id) => document.getElementById(id).src.includes("img/wi-fi0.png");
    const isOnu = (id) => document.getElementById(id).src.includes("img/onu0.png");
    const isServer = (id) => document.getElementById(id).src.includes("img/server0.png");
    const isEmpty = (id) => document.getElementById(id).src.includes("img/shiro.png");

    // 正解条件: (img05とimg09がPC) AND (img06がWi-Fi) AND (img07がONU) AND (img08がServer)
    const correctCondition = 
        (isPc("img05") && isPc("img09") || isPc("img09") && isPc("img05")) &&
        isWifi("img06") && isOnu("img07") && isServer("img08");

    // 全てのマスが埋まっているか
    const allFilled = !isEmpty("img05") && !isEmpty("img06") && !isEmpty("img07") && !isEmpty("img08") && !isEmpty("img09");

    const backdrop = document.getElementById("modal-backdrop");
    const correctModal = document.getElementById("correct");
    const incorrectModal = document.getElementById("incorrect");
    
    backdrop.classList.remove("hidden");

    if (correctCondition) {
        correctModal.classList.remove("hidden");
    } else {
        incorrectModal.classList.remove("hidden");
        document.getElementById("hint").classList.remove("hidden");
        // ヒント表示ロジック（簡略化）
        if (!isWifi("img06") || !isOnu("img07") || !isServer("img08")) {
            document.getElementById("hintwifi").classList.remove("hidden");
            document.getElementById("hintonu").classList.remove("hidden");
            document.getElementById("hintserver").classList.remove("hidden");
        }
        if (!allFilled) {
             document.getElementById("hintshiro").classList.remove("hidden");
        }
    }
}

function btn02() { closeModal(); }
function closeModal() {
    document.getElementById('modal-backdrop').classList.add('hidden');
    document.getElementById('correct').classList.add('hidden');
    document.getElementById('incorrect').classList.add('hidden');

    ['hintpc', 'hintserver', 'hintonu', 'hintwifi', 'hintshiro'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add("hidden");
    });

    const btn = document.getElementById("btn01");
    btn.textContent = "答え合わせをする";
    btn.disabled = false;
}

// --- Canvas描画 ---
function init() {
    const canvas = document.getElementById("canvas");
    if (!canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const getRect = (id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect() : null;
    };
    
    const rects = {
        pc1: getRect('img05'),
        pc2: getRect('img09'),
        wifi: getRect('img06'),
        onu: getRect('img07'),
        server: getRect('img08'),
        canvas: canvas.getBoundingClientRect()
    };
    if (!rects.pc1 || !rects.pc2 || !rects.wifi || !rects.onu || !rects.server) return;

    const getCenterY = (rect) => rect.top + rect.height / 2 - rects.canvas.top;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 線を描画
    ctx.lineWidth = 5;
    // PC1 -> Wi-Fi
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(rects.pc1.right - rects.canvas.left, getCenterY(rects.pc1));
    ctx.lineTo(rects.wifi.left - rects.canvas.left, getCenterY(rects.wifi));
    ctx.stroke();
    // PC2 -> Wi-Fi
    ctx.beginPath();
    ctx.moveTo(rects.pc2.right - rects.canvas.left, getCenterY(rects.pc2));
    ctx.lineTo(rects.wifi.left - rects.canvas.left, getCenterY(rects.wifi));
    ctx.stroke();
    // Wi-Fi -> ONU
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(rects.wifi.right - rects.canvas.left, getCenterY(rects.wifi));
    ctx.lineTo(rects.onu.left - rects.canvas.left, getCenterY(rects.onu));
    ctx.stroke();
    // ONU -> Server
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(rects.onu.right - rects.canvas.left, getCenterY(rects.onu));
    ctx.lineTo(rects.server.left - rects.canvas.left, getCenterY(rects.server));
    ctx.stroke();

    // 家を描画
    const houseLeft = rects.pc1.left - rects.canvas.left - 20;
    const houseRight = rects.onu.right - rects.canvas.left + 20;
    const houseTop = rects.pc1.top - rects.canvas.top - 30;
    const houseBottom = rects.pc2.bottom - rects.canvas.top + 20;
    const houseWidth = houseRight - houseLeft;
    
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 10;
    ctx.strokeRect(houseLeft, houseTop, houseWidth, houseBottom - houseTop);
    
    // 屋根
    ctx.beginPath();
    ctx.moveTo(houseLeft - 20, houseTop);
    ctx.lineTo(houseLeft + houseWidth / 2, houseTop - 140);
    ctx.lineTo(houseRight + 20, houseTop);
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}