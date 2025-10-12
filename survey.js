document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('surveyForm');
    const thankYouMessage = document.getElementById('thankYouMessage');
    
    // ▼▼▼【ここから追加】▼▼▼
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutButton = document.getElementById('logoutButton');

    // --- ログイン状態をチェックしてUIを更新 ---
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
    if (authData && authData.user) {
        // ログインしている場合
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    } else {
        // ログアウトしている場合
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }

    // --- ログアウト機能 ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supabase.auth.token');
        window.location.href = 'login.html'; // ログインページにリダイレクト
    });
    // ▲▲▲【追加ここまで】▲▲▲

    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = document.querySelector('input[name="role"]:checked')?.value;
        const usage = Array.from(document.querySelectorAll('input[name="usage"]:checked')).map(cb => cb.value);
        const satisfaction = document.querySelector('input[name="satisfaction"]:checked')?.value;
        const comments = document.getElementById('comments').value;

        try {
            const response = await fetch('/api/submit-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: role,
                    usage: usage,
                    satisfaction: satisfaction ? parseInt(satisfaction) : null,
                    comments: comments
                })
            });

            if (!response.ok) {
                throw new Error('サーバーへの送信に失敗しました。');
            }

            surveyForm.style.display = 'none';
            thankYouMessage.style.display = 'block';

        } catch (error) {
            console.error('アンケート送信エラー:', error);
            alert('エラーが発生しました。もう一度お試しください。');
        }
    });
});