document.addEventListener('DOMContentLoaded', () => {
    const buyBtn = document.getElementById('buy-btn');
    const juiceSelect = document.getElementById('juice-select');
    const moneyInput = document.getElementById('money-input');
    const codeToggleBtn = document.getElementById('code-toggle-btn');
    const codeWrapper = document.getElementById('code-wrapper');
    const statusText = document.getElementById('status-text');
    
    const elements = {
        scopes: {
            global: document.getElementById('global-scope'),
            function: document.getElementById('function-scope')
        },
        codeLines: {},
        vars: {
            g_money: document.getElementById('var-g-money'),
            g_juice: document.getElementById('var-g-juice'),
            g_result: document.getElementById('var-g-result'),
            g_sales: document.getElementById('var-g-sales'),
            l_money: document.getElementById('var-l-money'),
            l_juice: document.getElementById('var-l-juice'),
            l_price: document.getElementById('var-l-price'),
            l_change: document.getElementById('var-l-change')
        }
    };
    for(let i=1; i<=16; i++) {
        const el = document.getElementById(`line${i}`);
        if(el) elements.codeLines[`line${i}`] = el;
    }

    let totalSales = 0;

    codeToggleBtn.addEventListener('click', () => {
        codeToggleBtn.classList.toggle('open');
        codeWrapper.classList.toggle('open');
    });

    function highlight(target, className, remove=false) {
        if(target) target.classList[remove ? 'remove' : 'add'](className);
    }
    
    function setValue(varElement, value) {
        varElement.querySelector('.value').textContent = value;
    }
    
    function setStatus(text) {
        statusText.innerHTML = text;
    }

    function resetHighlights() {
        Object.values(elements.scopes).forEach(el => el.classList.remove('highlight-scope'));
        Object.values(elements.vars).forEach(el => el.className = 'variable');
        Object.values(elements.codeLines).forEach(el => el.classList.remove('highlight-code'));
    }
    
    async function runAnimation(money, choice) {
        buyBtn.disabled = true;

        // 0. 初期化
        Object.values(elements.vars).forEach(el => setValue(el, '...'));
        setValue(elements.vars.g_sales, totalSales);
        resetHighlights();

        // 1. メインプログラムの変数設定
        setStatus('メインプログラムで、購入するお金とジュースの変数を準備します。');
        highlight(elements.scopes.global, 'highlight-scope');
        highlight(elements.codeLines.line14, 'highlight-code');
        highlight(elements.codeLines.line15, 'highlight-code');
        setValue(elements.vars.g_money, money);
        setValue(elements.vars.g_juice, `"${choice}"`);
        await new Promise(r => setTimeout(r, 2000));
        
        // 2. 関数呼び出しと引数の受け渡し
        setStatus(`関数を呼び出します。<br>実引数 <code>${money}</code> と <code>"${choice}"</code> が、関数の仮引数に渡されます。`);
        highlight(elements.codeLines.line14, 'highlight-code', true);
        highlight(elements.codeLines.line15, 'highlight-code', true);
        highlight(elements.codeLines.line16, 'highlight-code');
        highlight(elements.vars.g_money, 'highlight-pass');
        highlight(elements.vars.g_juice, 'highlight-pass');
        await new Promise(r => setTimeout(r, 2000));
        
        // 3. 関数スコープへ移動
        setStatus('処理が関数の中に移ります。渡された引数が、関数内の変数（仮引数）にコピーされました。');
        highlight(elements.scopes.global, 'highlight-scope', true);
        highlight(elements.scopes.function, 'highlight-scope');
        highlight(elements.codeLines.line16, 'highlight-code', true);
        highlight(elements.codeLines.line5, 'highlight-code');
        setValue(elements.vars.l_money, money);
        setValue(elements.vars.l_juice, `"${choice}"`);
        highlight(elements.vars.g_money, 'highlight-pass', true);
        highlight(elements.vars.g_juice, 'highlight-pass', true);
        highlight(elements.vars.l_money, 'highlight-receive');
        highlight(elements.vars.l_juice, 'highlight-receive');
        await new Promise(r => setTimeout(r, 2000));
        
        // 4. 関数内部の計算
        setStatus('関数の中だけで使える「ローカル変数」を使って、計算が行われます。');
        highlight(elements.vars.l_money, 'highlight-receive', true);
        highlight(elements.vars.l_juice, 'highlight-receive', true);
        highlight(elements.codeLines.line5, 'highlight-code', true);
        const price = (choice === 'お茶') ? 130 : 150;
        highlight(elements.codeLines.line6, 'highlight-code');
        highlight(elements.codeLines.line7, 'highlight-code');
        highlight(elements.codeLines.line8, 'highlight-code');
        setValue(elements.vars.l_price, price);
        highlight(elements.vars.l_price, 'highlight-calc');
        await new Promise(r => setTimeout(r, 2000));
        
        highlight(elements.codeLines.line6, 'highlight-code', true);
        highlight(elements.codeLines.line7, 'highlight-code', true);
        highlight(elements.codeLines.line8, 'highlight-code', true);
        highlight(elements.codeLines.line9, 'highlight-code');
        const change = money - price;
        setValue(elements.vars.l_change, change);
        highlight(elements.vars.l_price, 'highlight-calc', true);
        highlight(elements.vars.l_change, 'highlight-calc');
        await new Promise(r => setTimeout(r, 2000));

        // 5. 戻り値を返す
        setStatus('計算結果を「戻り値」として、関数の呼び出し元に返します。');
        highlight(elements.vars.l_change, 'highlight-calc', true);
        highlight(elements.codeLines.line9, 'highlight-code', true);
        highlight(elements.codeLines.line11, 'highlight-code');
        const returnValue = `${choice}と おつり${change}円`;
        highlight(elements.vars.l_change, 'highlight-return');
        await new Promise(r => setTimeout(r, 2000));
        
        // 6. グローバルスコープへ戻り、結果を代入
        setStatus('メインプログラムに戻り、受け取った戻り値を変数 `result` に代入します。');
        highlight(elements.scopes.function, 'highlight-scope', true);
        highlight(elements.scopes.global, 'highlight-scope');
        highlight(elements.codeLines.line11, 'highlight-code', true);
        highlight(elements.codeLines.line16, 'highlight-code');
        setValue(elements.vars.g_result, `"${returnValue}"`);
        highlight(elements.vars.l_change, 'highlight-return', true);
        highlight(elements.vars.g_result, 'highlight-receive');
        
        // 7. グローバル変数の更新
        totalSales += price;
        setValue(elements.vars.g_sales, totalSales);
        await new Promise(r => setTimeout(r, 2000));
        
        // 8. 最終的な片付け
        resetHighlights();
        setStatus('処理が完了しました。関数内のローカル変数は消え、グローバル変数の値が更新されました。');
        buyBtn.disabled = false;
    }

    buyBtn.addEventListener('click', () => {
        const money = parseInt(moneyInput.value, 10);
        const choice = juiceSelect.value;
        runAnimation(money, choice);
    });

    // 初期状態でコードを閉じておく
    codeToggleBtn.classList.remove('open');
    codeWrapper.classList.remove('open');
});