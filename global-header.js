// global-header.js
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutButton = document.getElementById('logoutButton');

    // ログイン状態をチェックしてUIを更新
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
    if (authData && authData.user) {
        // ログインしている場合：「ログアウト」ボタンのみ表示
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    } else {
        // ログアウトしている場合：「ログイン」「新規登録」リンクを表示
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }

    // ログアウト機能
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supabase.auth.token');
        window.location.href = '/login.html';
    });
});