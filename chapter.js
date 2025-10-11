document.addEventListener('DOMContentLoaded', function() {
    const toggles = document.querySelectorAll('.accordion-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // クリックされたボタンに active クラスを付け外し（矢印の向きを制御）
            toggle.classList.toggle('active');

            // 対応するサブメニューを取得して show クラスを付け外し（メニューを開閉）
            const menu = toggle.nextElementSibling;
            if (menu && menu.classList.contains('menu-buttons')) {
                menu.classList.toggle('show');
            }
        });
    });
});