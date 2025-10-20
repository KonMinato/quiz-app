document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('surveyForm');
    const thankYouMessage = document.getElementById('thankYouMessage');

    surveyForm.addEventListener('submit', (e) => {
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
            q12_importance: document.querySelector('input[name="q12_importance"]:checked')?.value,
            q13_knowledge: document.querySelector('input[name="q13_knowledge"]:checked')?.value,
            q14_desire_to_improve: document.querySelector('input[name="q14_desire_to_improve"]:checked')?.value,
            
            // ▼▼▼【ここから追加】▼▼▼
            q15_ai_difficulty: document.querySelector('input[name="q15_ai_difficulty"]:checked')?.value,
            q16_ai_speed: document.querySelector('input[name="q16_ai_speed"]:checked')?.value,
            q17_ai_relevance: document.querySelector('input[name="q17_ai_relevance"]:checked')?.value,
            q18_ai_usability: document.querySelector('input[name="q18_ai_usability"]:checked')?.value,
            ai_comments: document.getElementById('ai_comments').value
            // ▲▲▲【追加ここまで】▲▲▲
        };

        // 
        // ここに将来、データをSupabaseに送信する処理を記述します。
        // （/api/submit-post-survey のような、事前アンケートとは別のAPIエンドポイントが必要です）
        //
        
        // フォームを非表示にし、サンキューメッセージを表示
        surveyForm.style.display = 'none';
        thankYouMessage.style.display = 'block';

        alert('アンケートにご協力いただき、ありがとうございます！');
    });
});