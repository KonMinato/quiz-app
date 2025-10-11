document.addEventListener('DOMContentLoaded', () => {
    // テーブルとコントロール要素の取得
    const knowledgeTableBody = document.getElementById('knowledgeScoreTableBody');
    const programmingTableBody = document.getElementById('programmingScoreTableBody');
    const calcTableBody = document.getElementById('calcScoreTableBody');
    const knowledgeSortSelect = document.getElementById('knowledgeSort');
    const programmingSortSelect = document.getElementById('programmingSort');
    const calcSortSelect = document.getElementById('calcSort');
    const resetButton = document.getElementById('resetButton');

    let allScores = []; // スコアデータを配列として保持

    // --- 認証済みAPIリクエストのためのヘッダーを生成 ---
    function getAuthHeaders() {
        const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
        if (!authData || !authData.session || !authData.session.access_token) {
            window.location.href = 'login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.session.access_token
        };
    }

    // メインの描画関数
    function renderTables() {
        const knowledgeScores = allScores.filter(s => s.type === '知識問題');
        const programmingScores = allScores.filter(s => s.type === 'プログラム作成問題');
        const calcScores = allScores.filter(s => s.type === '計算問題' || s.type === '進数問題');

        populateTable(knowledgeTableBody, knowledgeScores, knowledgeSortSelect.value);
        populateTable(programmingTableBody, programmingScores, programmingSortSelect.value);
        populateTable(calcTableBody, calcScores, calcSortSelect.value);
    }

    // テーブル描画のヘルパー関数 (ソートロジックは変更なし)
    const populateTable = (tableBody, scoreArray, sortType) => {
        tableBody.innerHTML = '';

        if (scoreArray.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'まだ学習記録がありません。';
            cell.style.textAlign = 'center';
            return;
        }

        const chapterOrder = { "情報社会": 1, "情報デザイン": 2, "デジタル": 3, "ネットワーク": 4, "問題解決": 5, "プログラミング": 6 };
        
        scoreArray.sort((a, b) => {
            const accuracyA = a.total > 0 ? a.correct / a.total : -1;
            const accuracyB = b.total > 0 ? b.correct / b.total : -1;

            switch (sortType) {
                case 'accuracy-asc':
                    return accuracyA - accuracyB;
                case 'accuracy-desc':
                    return accuracyB - accuracyA;
                case 'accuracy-by-chapter-asc':
                    const orderA_asc = chapterOrder[a.chapter] || 99;
                    const orderB_asc = chapterOrder[b.chapter] || 99;
                    if (orderA_asc !== orderB_asc) return orderA_asc - orderB_asc;
                    return accuracyA - accuracyB;
                case 'accuracy-by-chapter-desc':
                    const orderA_desc = chapterOrder[a.chapter] || 99;
                    const orderB_desc = chapterOrder[b.chapter] || 99;
                    if (orderA_desc !== orderB_desc) return orderA_desc - orderB_desc;
                    return accuracyB - accuracyA;
                case 'default':
                default:
                    const defaultOrderA = chapterOrder[a.chapter] || 99;
                    const defaultOrderB = chapterOrder[b.chapter] || 99;
                    if (defaultOrderA !== defaultOrderB) return defaultOrderA - defaultOrderB;
                    return a.tangen.localeCompare(b.tangen);
            }
        });

        scoreArray.forEach(scoreData => {
            const correct = scoreData.correct;
            const total = scoreData.total;
            const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;

            const row = tableBody.insertRow();
            row.insertCell().textContent = scoreData.chapter;
            row.insertCell().textContent = scoreData.tangen;
            row.insertCell().textContent = `${correct} / ${total}`;
            row.insertCell().textContent = `${accuracy}%`;
        });
    };

    // --- イベントリスナー ---
    knowledgeSortSelect.addEventListener('change', renderTables);
    programmingSortSelect.addEventListener('change', renderTables);
    calcSortSelect.addEventListener('change', renderTables);
    
    // リセットボタンは未実装のため、一旦無効化
    resetButton.disabled = true;
    resetButton.title = 'この機能は現在開発中です。';
    resetButton.style.backgroundColor = '#95a5a6';
    resetButton.style.cursor = 'not-allowed';

    // --- 初期データの読み込みと表示 ---
    async function fetchAndDisplayScores() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch('/api/scores', { headers });
            if (!response.ok) {
                throw new Error('成績データの取得に失敗しました。');
            }
            allScores = await response.json();
            renderTables();
        } catch (error) {
            console.error(error);
            // エラーメッセージをテーブルに表示するなどの処理
        }
    }

    fetchAndDisplayScores();
});