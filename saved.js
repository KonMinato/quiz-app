document.addEventListener('DOMContentLoaded', () => {
    const knowledgeListBody = document.getElementById('knowledgeListBody');
    const programmingListBody = document.getElementById('programmingListBody');
    const calcListBody = document.getElementById('calcListBody');
    const questionDisplayArea = document.getElementById('questionDisplayArea');
    const deleteAllButton = document.getElementById('deleteAllButton');

    let savedQuestions = [];

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

    // メインのリスト表示関数
    function renderQuestionLists() {
        knowledgeListBody.innerHTML = '';
        programmingListBody.innerHTML = '';
        calcListBody.innerHTML = '';
        
        const knowledgeQuestions = savedQuestions.filter(q => q.type === '知識問題');
        const programmingQuestions = savedQuestions.filter(q => q.type === 'プログラム作成問題');
        const calcQuestions = savedQuestions.filter(q => q.type === '計算問題' || q.type === '進数問題');

        const populateList = (tableBody, questionsArray) => {
            if (questionsArray.length === 0) {
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 4;
                cell.textContent = `保存された問題はありません。`;
                cell.style.textAlign = 'center';
                return;
            }
            questionsArray.forEach(q => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = q.chapter;
                row.insertCell().textContent = q.tangen;
                const previewCell = row.insertCell();
                const cleanQuestionText = q.question.replace(/```(?:\w*\n)?([\s\S]+)```/g, '$1').replace(/\n/g, ' ');
                previewCell.textContent = cleanQuestionText.length > 30 ? cleanQuestionText.substring(0, 30) + '...' : cleanQuestionText;
                const resultCell = row.insertCell();
                resultCell.textContent = q.wasCorrect ? '正解' : '不正解';
                resultCell.className = q.wasCorrect ? 'result-correct' : 'result-incorrect';
                row.addEventListener('click', () => displayQuestionForRetake(q));
            });
        };

        populateList(knowledgeListBody, knowledgeQuestions);
        populateList(programmingListBody, programmingQuestions);
        populateList(calcListBody, calcQuestions);
    }

    // 選択された問題を右側に表示して再挑戦させる関数
    function displayQuestionForRetake(q) {
        questionDisplayArea.innerHTML = ''; 
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';

        let questionHtml = `<p class="question-text"><b>問題:</b> ${escapeHtml(q.question)}</p>`;
        if (q.question.includes('```')) {
            const codeContent = q.question.replace(/^```(?:\w*\n)?/g, '').replace(/```$/g, '').trim();
            questionHtml = `<p class="question-text"><b>問題:</b></p><pre><code>${escapeHtml(codeContent)}</code></pre>`;
        }
        
        const choices = [q.correct_answer, ...q.distractors].sort(() => Math.random() - 0.5);
        const choicesHtml = choices.map(choice => `<label><input type="radio" name="retake-q" value="${escapeHtml(choice)}"><code>${escapeHtml(choice)}</code></label>`).join('');

        const controlsHtml = `
            <button id="retakeSubmitBtn" class="btn btn-primary">解答する</button>
            <button id="retakeDeleteBtn" class="btn btn-danger" style="margin-left:10px;">この問題をリストから削除</button>
            <div class="result-area"></div>`;

        questionBlock.innerHTML = questionHtml + `<div class="choices">${choicesHtml}</div>` + controlsHtml;
        questionDisplayArea.appendChild(questionBlock);

        document.getElementById('retakeSubmitBtn').addEventListener('click', () => {
            const userAnswer = document.querySelector('input[name="retake-q"]:checked')?.value;
            const resultArea = questionBlock.querySelector('.result-area');
            
            if (userAnswer === q.correct_answer) {
                resultArea.innerHTML = `<p class="correct">正解！</p>`;
            } else {
                resultArea.innerHTML = `<p class="incorrect">不正解... 正しい答えは「<b>${escapeHtml(q.correct_answer)}</b>」です。</p>`;
            }
            resultArea.innerHTML += `<div class="explanation"><h4>解説</h4><p>${escapeHtml(q.explanation)}</p></div>`;
        });

        document.getElementById('retakeDeleteBtn').addEventListener('click', async () => {
            if (confirm('この問題をリストから削除しますか？')) {
                const headers = getAuthHeaders();
                if (!headers) return;
                try {
                    await fetch('/api/saved-questions', {
                        method: 'DELETE',
                        headers: headers,
                        body: JSON.stringify({ id: q.id })
                    });
                    questionDisplayArea.innerHTML = '<p class="placeholder">リストから問題を選択して再挑戦できます。</p>';
                    fetchAndDisplaySavedQuestions(); // リストを更新
                } catch (error) {
                    alert('削除に失敗しました。');
                }
            }
        });
    }

    // すべて削除ボタンの処理
    deleteAllButton.addEventListener('click', async () => {
        if (confirm('保存した問題をすべて削除しますか？この操作は元に戻せません。')) {
            const headers = getAuthHeaders();
            if (!headers) return;
            try {
                await fetch('/api/saved-questions', {
                    method: 'DELETE',
                    headers: headers
                });
                questionDisplayArea.innerHTML = '<p class="placeholder">リストから問題を選択して再挑戦できます。</p>';
                fetchAndDisplaySavedQuestions(); // リストを更新
            } catch (error) {
                alert('すべての問題の削除に失敗しました。');
            }
        }
    });
    
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // --- 初期データの読み込みと表示 ---
    async function fetchAndDisplaySavedQuestions() {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch('/api/saved-questions', { headers });
            if (!response.ok) throw new Error('保存済み問題の取得に失敗しました。');
            savedQuestions = await response.json();
            renderQuestionLists();
        } catch (error) {
            console.error(error);
        }
    }

    fetchAndDisplaySavedQuestions();
});