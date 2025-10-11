document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('surveyForm');
    const thankYouMessage = document.getElementById('thankYouMessage');

    surveyForm.addEventListener('submit', (e) => {
        // フォームのデフォルトの送信動作をキャンセル
        e.preventDefault();

        // ここに将来、データをサーバーに送信する処理などを記述します。
        // 例: const formData = new FormData(surveyForm); ...

        // フォームを非表示にし、サンキューメッセージを表示
        surveyForm.style.display = 'none';
        thankYouMessage.style.display = 'block';

        alert('アンケートにご協力いただき、ありがとうございます！');
    });
});