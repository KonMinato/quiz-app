document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // 新規登録フォームの処理
    if (registerForm) {
        const agreeCheckbox = document.getElementById('agreeCheckbox');
        const registerButton = document.getElementById('registerButton');

        // チェックボックスの状態を監視
        agreeCheckbox.addEventListener('change', () => {
            registerButton.disabled = !agreeCheckbox.checked;
        });

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
            
            // ▼▼▼【ここからが修正箇所】▼▼▼
            if (response.ok) {
                messageDiv.style.color = 'green';
                // フォームを非表示にする
                registerForm.style.display = 'none'; 
                // 表示するメッセージを変更し、ログインページへのリンクを追加
                messageDiv.innerHTML = `
                    <p style="font-weight: bold; font-size: 1.1em;">登録ありがとうございます！</p>
                    <p style="text-align: left; margin-top: 15px;">
                        確認メールを <strong>${escapeHtml(email)}</strong> 宛に送信しました。<br><br>
                        1. メール内の「Confirm your email」リンクをクリックして、認証を完了させてください。<br>
                        2. 認証完了後、<a href="/login.html">ログインページ</a>からログインしてください。
                    </p>
                `;
            } else {
            // ▲▲▲【修正箇所ここまで】▲▲▲
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
                window.location.href = '/toppage.html'; // トップページに変更
            } else {
                messageDiv.textContent = data.error || 'ログインに失敗しました。';
            }
        });
    }
});

// この関数をauth.jsの末尾に追加します
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}