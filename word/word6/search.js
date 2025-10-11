document.addEventListener('DOMContentLoaded', () => {
    const linearBtn = document.getElementById('linear-btn');
    const binaryBtn = document.getElementById('binary-btn');
    const resetBtn = document.getElementById('reset-btn');
    const targetValueInput = document.getElementById('target-value');
    const lockerArea = document.getElementById('locker-area');
    const countSpan = document.getElementById('count-span');
    const simulatorTitle = document.getElementById('simulator-title');
    const explanationPanel = document.getElementById('explanation-panel');
    
    const LOCKER_COUNT = 32;

    function resetBoard() {
        lockerArea.innerHTML = '';
        for (let i = 0; i < LOCKER_COUNT; i++) {
            const locker = document.createElement('div');
            locker.className = 'locker';
            locker.textContent = i;
            locker.id = `locker-${i}`;
            lockerArea.appendChild(locker);
        }
        countSpan.textContent = 0;
        // ▼▼▼【変更点】ここのテキストを空にしました ▼▼▼
        simulatorTitle.textContent = '';
        explanationPanel.textContent = '';
    }

    function toggleButtons(disabled) {
        linearBtn.disabled = disabled;
        binaryBtn.disabled = disabled;
        resetBtn.disabled = disabled;
    }
    
    function getTarget() {
        const target = parseInt(targetValueInput.value, 10);
        if(isNaN(target) || target < 0 || target > LOCKER_COUNT - 1) {
            alert('0から31の数字を入力してください。');
            return null;
        }
        return target;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function linearSearch(target) {
        let count = 0;
        for (let i = 0; i < LOCKER_COUNT; i++) {
            count++;
            countSpan.textContent = count;
            const locker = document.getElementById(`locker-${i}`);
            
            explanationPanel.textContent = `端から順番に調べます。${i}番のロッカーを開けます...`;
            locker.classList.add('checking');
            await sleep(100);

            if (i === target) {
                explanationPanel.textContent = `${i}番で発見！探索を終了します。`;
                locker.classList.remove('checking');
                locker.classList.add('found');
                return;
            } else {
                 locker.classList.remove('checking');
            }
        }
        explanationPanel.textContent = `見つかりませんでした。`;
    }
    
    async function binarySearch(target) {
        let count = 0;
        let low = 0;
        let high = LOCKER_COUNT - 1;

        while (low <= high) {
            count++;
            countSpan.textContent = count;
            
            explanationPanel.textContent = `探索範囲は ${low} から ${high} です。`;
            const lowLocker = document.getElementById(`locker-${low}`);
            const highLocker = document.getElementById(`locker-${high}`);
            lowLocker.classList.add('boundary');
            if (low !== high) highLocker.classList.add('boundary');
            await sleep(1200);

            let mid = Math.floor((low + high) / 2);
            explanationPanel.textContent = `中央の値である ${mid}番 を確認します...`;
            const midLocker = document.getElementById(`locker-${mid}`);
            midLocker.classList.add('checking');
            await sleep(1500);

            if (mid === target) {
                explanationPanel.textContent = `${mid}番で発見！探索を終了します。`;
                lowLocker.classList.remove('boundary');
                if (low !== high) highLocker.classList.remove('boundary');
                midLocker.classList.remove('checking');
                midLocker.classList.add('found');
                return;
            } else if (target < mid) {
                explanationPanel.textContent = `探す値(${target})は中央(${mid})より小さいので、右半分を捨てます。`;
                for(let i = mid; i <= high; i++) {
                    document.getElementById(`locker-${i}`).classList.add('discarded');
                }
                high = mid - 1;
            } else {
                explanationPanel.textContent = `探す値(${target})は中央(${mid})より大きいので、左半分を捨てます。`;
                for(let i = low; i <= mid; i++) {
                    document.getElementById(`locker-${i}`).classList.add('discarded');
                }
                low = mid + 1;
            }
            
            lowLocker.classList.remove('boundary');
            highLocker.classList.remove('boundary');
            midLocker.classList.remove('checking');
            await sleep(1200);
        }
        explanationPanel.textContent = `見つかりませんでした。`;
    }

    linearBtn.addEventListener('click', async () => {
        const target = getTarget();
        if (target === null) return;
        
        toggleButtons(true);
        resetBoard();
        simulatorTitle.textContent = '線形探索';
        await linearSearch(target);
        toggleButtons(false);
    });
    
    binaryBtn.addEventListener('click', async () => {
        const target = getTarget();
        if (target === null) return;
        
        toggleButtons(true);
        resetBoard();
        simulatorTitle.textContent = '二分探索';
        await binarySearch(target);
        toggleButtons(false);
    });

    resetBtn.addEventListener('click', () => {
        resetBoard();
        toggleButtons(false);
    });
    
    resetBoard();
});