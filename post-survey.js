document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('surveyForm');
    const thankYouMessage = document.getElementById('thankYouMessage');

    // ▼▼▼【ここから追加】認証ヘッダー取得関数 ▼▼▼
    function getAuthHeaders() {
        const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
        if (!authData || !authData.session || !authData.session.access_token) {
            alert('セッションが切れました。再度ログインしてください。');
            window.location.href = 'login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.session.access_token
        };
    }
    // ▲▲▲【追加ここまで】▲▲▲

    // --- 順位付けのロジック (変更なし) ---
    function setupRankingGroup(groupName) {
        const selects = [
            document.querySelector(`select[name="${groupName}_rank_1"]`),
            document.querySelector(`select[name="${groupName}_rank_2"]`),
            document.querySelector(`select[name="${groupName}_rank_3"]`)
        ];
        const noneCheckbox = document.querySelector(`input[name="${groupName}_rank_none"]`);

        function updateDropdowns() {
            const selectedValues = selects.map(s => s.value);
            selects.forEach(currentSelect => {
                Array.from(currentSelect.options).forEach(option => {
                    if (option.value === "") { option.disabled = false; return; }
                    const isSelectedElsewhere = selectedValues.includes(option.value);
                    const isSelectedHere = (currentSelect.value === option.value);
                    option.disabled = (isSelectedElsewhere && !isSelectedHere);
                });
            });
        }

        noneCheckbox.addEventListener('change', () => {
            if (noneCheckbox.checked) {
                selects.forEach((select) => {
                    select.disabled = true;
                    select.value = "";
                });
            } else {
                selects.forEach(select => {
                    select.disabled = false;
                });
            }
            updateDropdowns();
        });

        selects.forEach(select => {
            select.addEventListener('change', () => {
                if (select.value !== "") {
                    noneCheckbox.checked = false;
                }
                updateDropdowns();
            });
        });
        updateDropdowns();
    }
    setupRankingGroup('q20');
    setupRankingGroup('q21');
    setupRankingGroup('q22');
    // --- 順位付けロジックここまで ---

    surveyForm.addEventListener('submit', async (e) => { // ★ asyncを追加
        e.preventDefault();

        // フォームからデータを収集
        const data = {
            q1_realization: document.querySelector('input[name="q1_realization"]:checked')?.value,
            q2_familiarity: document.querySelector('input[name="q2_familiarity"]:checked')?.value,
            q3_fun: document.querySelector('input[name="q3_fun"]:checked')?.value,
            q4_understanding: document.querySelector('input[name="q4_understanding"]:checked')?.value,
            q5_programming_fun: document.querySelector('input[name="q5_programming_fun"]:checked')?.value,
            q6_purpose: document.querySelector('input[name="q6_purpose"]:checked')?.value,
            q7_curiosity: document.querySelector('input[name="q7_curiosity"]:checked')?.value,
            q8_utility: document.querySelector('input[name="q8_utility"]:checked')?.value,
            q9_effort: document.querySelector('input[name="q9_effort"]:checked')?.value,
            q10_self_study: document.querySelector('input[name="q10_self_study"]:checked')?.value,
            q11_goals: document.querySelector('input[name="q11_goals"]:checked')?.value,
            q12_communication: document.querySelector('input[name="q12_communication"]:checked')?.value,
            q13_reaction: document.querySelector('input[name="q13_reaction"]:checked')?.value,
            q14_relevance: document.querySelector('input[name="q14_relevance"]:checked')?.value,
            q15_attendance: document.querySelector('input[name="q15_attendance"]:checked')?.value,
            q16_participation: document.querySelector('input[name="q16_participation"]:checked')?.value,
            q17_importance: document.querySelector('input[name="q17_importance"]:checked')?.value,
            q18_knowledge: document.querySelector('input[name="q18_knowledge"]:checked')?.value,
            q19_desire_to_improve: document.querySelector('input[name="q19_desire_to_improve"]:checked')?.value,
            
            q20_rank_1: document.querySelector('select[name="q20_rank_1"]').value,
            q20_rank_2: document.querySelector('select[name="q20_rank_2"]').value,
            q20_rank_3: document.querySelector('select[name="q20_rank_3"]').value,
            q20_rank_none: document.querySelector('input[name="q20_rank_none"]').checked,

            q21_rank_1: document.querySelector('select[name="q21_rank_1"]').value,
            q21_rank_2: document.querySelector('select[name="q21_rank_2"]').value,
            q21_rank_3: document.querySelector('select[name="q21_rank_3"]').value,
            q21_rank_none: document.querySelector('input[name="q21_rank_none"]').checked,

            q22_rank_1: document.querySelector('select[name="q22_rank_1"]').value,
            q22_rank_2: document.querySelector('select[name="q22_rank_2"]').value,
            q22_rank_3: document.querySelector('select[name="q22_rank_3"]').value,
            q22_rank_none: document.querySelector('input[name="q22_rank_none"]').checked,

            q23_ai_usability: document.querySelector('input[name="q23_ai_usability"]:checked')?.value,
            ai_comments: document.getElementById('ai_comments').value
        };
        
        // ▼▼▼【ここから修正】データをSupabaseに送信 ▼▼▼
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch('/api/submit-post-survey', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'サーバーへの送信に失敗しました。');
            }

            surveyForm.style.display = 'none';
            thankYouMessage.style.display = 'block';

            alert('アンケートにご協力いただき、ありがとうございます！');

        } catch (error) {
            console.error('アンケート送信エラー:', error);
            alert('エラーが発生しました。もう一度お試しください。\n' + error.message);
        }
        // ▲▲▲【修正ここまで】▲▲▲
    });
});