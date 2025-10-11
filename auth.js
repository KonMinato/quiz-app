document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // 新規登録フォームの処理
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                messageDiv.style.color = 'green';
                messageDiv.textContent = '登録ありがとうございます。確認メールを送信しましたので、メール内のリンクをクリックして登録を完了してください。';
            } else {
                messageDiv.textContent = data.error || '登録に失敗しました。';
            }
        });
    }

    // ログインフォームの処理
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('supabase.auth.token', JSON.stringify(data));
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'ログインに成功しました。';
                window.location.href = '/index.html'; // 問題作成ページへ
            } else {
                messageDiv.textContent = data.error || 'ログインに失敗しました。';
            }
        });
    }
});