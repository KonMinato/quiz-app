document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.topic-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            // クリックされたヘッダーに active クラスを付け外し
            header.classList.toggle('active');

            // 対応する詳細コンテンツを取得して show クラスを付け外し
            const details = header.nextElementSibling;
            if (details && details.classList.contains('details')) {
                details.classList.toggle('show');
            }
        });
    });
});