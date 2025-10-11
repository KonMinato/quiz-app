// auth-check.js

const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));

// ログイン情報（特にアクセストークン）がなければ、ログインページに強制的に移動させる
if (!authData || !authData.session || !authData.session.access_token) {
    // 例外：もし今いるページがログイン/登録ページなら、何もしない（無限ループを防ぐため）
    if (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html')) {
        // 何もしない
    } else {
        window.location.href = '/login.html';
    }
}