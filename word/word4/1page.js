// --- グローバル変数 ---
let draggedItem = null; // ドラッグ中の要素を保持

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    // Canvasの初期描画
    init();

    // 各機能のセットアップ
    setupAccordion();
    setupModalClose();
    setupButtons();
    setupDragAndDrop();
});

// 画像やウィンドウサイズが変更されたときにも再描画
window.addEventListener('load', init);
window.addEventListener('resize', init);


// --- 各機能のセットアップ関数 ---
function setupAccordion() {
    let openBox = null;
    document.querySelectorAll('.box').forEach(box => {
        box.addEventListener('click', () => {
            const isOpening = !box.classList.contains('open');
            if (openBox) {
                openBox.classList.remove('open');
            }
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
            if (event.target === modal) {
                closeModal();
            }
        });
    });
}

// 【重要】ここのbtn02の呼び出しを修正しました
function setupButtons() {
    document.getElementById('btn01').addEventListener('click', btn01);
    const btn02_element = document.getElementById('btn02'); // 変数名を変更
    if (btn02_element) {
        btn02_element.addEventListener('click', btn02); // btn02関数を呼び出す
    }
}

function setupDragAndDrop() {
    const draggableItems = document.querySelectorAll('[draggable="true"]');
    draggableItems.forEach(item => {
        // PC用：マウスイベント
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        // スマホ用：タッチイベント
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd);
    });

    const dropZones = document.querySelectorAll('.shiro img, .device img');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

// --- ドラッグ＆ドロップのイベントハンドラ ---

function handleDragStart(e) {
    draggedItem = this;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', null);
    }
    setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragEnd() {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

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

// --- タッチイベント用のハンドラ ---
function handleTouchStart(e) {
    e.preventDefault();
    handleDragStart.call(this, e);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
    
    if (dropTarget && dropTarget.tagName === 'IMG' && dropTarget.closest('.shiro, .device') && dropTarget !== draggedItem) {
        dropTarget.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    handleDragEnd.call(this);
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (dropTarget && dropTarget.tagName === 'IMG' && dropTarget.closest('.shiro, .device')) {
        handleDrop.call(dropTarget, e);
    }
    document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
}


// --- 正誤判定とモーダル関連 ---
function btn01() {
    const result1 = document.getElementById("img05").src.includes("img/pc0.png");
    const result2 = document.getElementById("img06").src.includes("img/wi-fi0.png");
    const result3 = document.getElementById("img07").src.includes("img/onu0.png");
    const result4 = document.getElementById("img08").src.includes("img/server0.png");

    const backdrop = document.getElementById("modal-backdrop");
    const correctModal = document.getElementById("correct");
    const incorrectModal = document.getElementById("incorrect");
    
    backdrop.classList.remove("hidden");

    if (result1 && result2 && result3 && result4) {
        correctModal.classList.remove("hidden");
    } else {
        incorrectModal.classList.remove("hidden");
        document.getElementById("hint").classList.remove("hidden");
        if (!result1) document.getElementById("hintpc").classList.remove("hidden");
        if (!result2) document.getElementById("hintwifi").classList.remove("hidden");
        if (!result3) document.getElementById("hintonu").classList.remove("hidden");
        if (!result4) document.getElementById("hintserver").classList.remove("hidden");
    }
}

function btn02() {
    closeModal();
}

function closeModal() {
    document.getElementById('modal-backdrop').classList.add('hidden');
    document.getElementById('correct').classList.add('hidden');
    document.getElementById('incorrect').classList.add('hidden');

    document.getElementById("hintpc").classList.add("hidden");
    document.getElementById("hintserver").classList.add("hidden");
    document.getElementById("hintonu").classList.add("hidden");
    document.getElementById("hintwifi").classList.add("hidden");

    const btn = document.getElementById("btn01");
    btn.textContent = "答え合わせ";
    btn.disabled = false;
}


// --- Canvas描画機能 ---
let ctx;
function init() {
    const canvas = document.getElementById("canvas");
    if (!canvas.getContext) return;
    ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const img05 = document.querySelector('#img05');
    if (!img05) return;
    const rect5 = img05.getBoundingClientRect();
    const img06 = document.querySelector('#img06');
    const rect6 = img06.getBoundingClientRect();
    const img07 = document.querySelector('#img07');
    const rect7 = img07.getBoundingClientRect();
    const img08 = document.querySelector('#img08');
    const rect8 = img08.getBoundingClientRect();
    
    const canvasRect = canvas.getBoundingClientRect();
    const getCenterY = (rect) => rect.top + rect.height / 2 - canvasRect.top;
    const centerY = getCenterY(rect5);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'green';
    ctx.beginPath(); 
    ctx.moveTo(rect5.right - canvasRect.left, centerY);
    ctx.lineTo(rect6.left - canvasRect.left, centerY);
    ctx.stroke();

    ctx.strokeStyle = 'red';
    ctx.beginPath(); 
    ctx.moveTo(rect6.right - canvasRect.left, centerY);
    ctx.lineTo(rect7.left - canvasRect.left, centerY);
    ctx.stroke();

    ctx.strokeStyle = 'yellow';
    ctx.beginPath(); 
    ctx.moveTo(rect7.right - canvasRect.left, centerY);
    ctx.lineTo(rect8.left - canvasRect.left, centerY);
    ctx.stroke();

    const houseTop = rect5.top - canvasRect.top - 30;
    const houseBottom = rect5.bottom - canvasRect.top + 30;
    const houseLeft = rect5.left - canvasRect.left - 20;
    const houseRight = rect7.right - canvasRect.left + 20;
    const houseWidth = houseRight - houseLeft;
    
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 10;
    ctx.strokeRect(houseLeft, houseTop, houseWidth, houseBottom - houseTop);

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