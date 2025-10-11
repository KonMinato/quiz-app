document.addEventListener('DOMContentLoaded', () => {
    // ボタン要素を取得
    const hideTermsBtn = document.getElementById('hide-terms-button');
    const hideContentBtn = document.getElementById('hide-content-button');
    const showAllBtn = document.getElementById('show-all-button');
    
    // 隠す対象となる要素をそれぞれ取得
    const terms = document.querySelectorAll('.term');
    const contents = document.querySelectorAll('.hide-me');
    const allTargets = document.querySelectorAll('.term, .hide-me');

    // 全ての要素を表示する共通の関数
    function showAll() {
        allTargets.forEach(target => {
            target.classList.remove('hidden');
        });
    }

    // 「単語だけ隠す」ボタンの処理
    hideTermsBtn.addEventListener('click', () => {
        showAll(); // 一旦すべて表示する
        terms.forEach(target => {
            target.classList.add('hidden');
        });
    });

    // 「内容を隠す」ボタンの処理
    hideContentBtn.addEventListener('click', () => {
        showAll(); // 一旦すべて表示する
        contents.forEach(target => {
            target.classList.add('hidden');
        });
    });

    // 「全て表示」ボタンの処理
    showAllBtn.addEventListener('click', () => {
        showAll();
    });

    // 各要素をクリックしたときの処理（単語と内容の両方が対象）
    allTargets.forEach(target => {
        target.addEventListener('click', (event) => {
            event.stopPropagation(); 
            target.classList.remove('hidden');
        });
    });
});