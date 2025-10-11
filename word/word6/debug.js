document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼【変更点1】各問題に正解時の出力(correctOutput)などを追加 ▼▼▼
    const allQuizData = {
        syntax: [
            {
                goal: '目的: 5 + 10 の計算結果である「15」を表示させよう。',
                initialCode: 'print(5 + 10',
                isCorrect: (code) => code.trim() === 'print(5 + 10)',
                correctOutput: '15',
                errorMessage: 'SyntaxError: unexpected EOF while parsing',
                hint: 'print()を閉じるための `)` が足りていないようです。コンピュータは、このような単純な文法のミスがあると、プログラムを一行も実行できません。'
            },
            {
                goal: '目的: 変数`age`が20以上なら「成人です」と表示させよう。',
                initialCode: 'age = 25\nif age >= 20\n    print("成人です")',
                isCorrect: (code) => code.includes('if age >= 20:'),
                correctOutput: '成人です',
                errorMessage: 'SyntaxError: invalid syntax',
                hint: 'if文やfor文の行の最後には、コロン `:` が必要です。'
            },
            {
                goal: '目的: 「Hello」という文字列を表示させよう。',
                initialCode: 'print("Hello\')',
                isCorrect: (code) => code.includes('print("Hello")') || code.includes("print('Hello')"),
                correctOutput: 'Hello',
                errorMessage: 'SyntaxError: EOL while scanning string literal',
                hint: '文字列を囲む引用符は、始まりと終わりで同じ種類（`"`と`"`、または`\'`と`\'`）を使う必要があります。'
            },
            // (他の構文エラー問題も同様の構造)
        ],
        runtime: [
            {
                goal: '目的: 10 ÷ 2 の計算結果である「5」を表示させよう。',
                initialCode: 'num = 10\nden = 0\nprint(num / den)',
                isCorrect: (code) => !code.includes('den = 0'),
                correctOutput: '5.0',
                errorMessage: 'ZeroDivisionError: division by zero',
                hint: '0で割り算はできません。`den` (分母) の値を0以外の数に修正しましょう。文法は正しいですが、実行してみると不可能な処理だった、というのが実行時エラーです。'
            },
            {
                goal: '目的: リストの3番目の要素である「c」を表示させよう。',
                initialCode: 'my_list = ["a", "b", "c"]\nprint(my_list[3])',
                isCorrect: (code) => code.includes('my_list[2]'),
                correctOutput: 'c',
                errorMessage: 'IndexError: list index out of range',
                hint: 'リストの添字（インデックス）は0から始まります。3番目の要素にアクセスするには、インデックスは `2` になります。'
            },
             // (他の実行時エラー問題も同様の構造)
        ],
        logical: [
            {
                goal: '目的: 2つの数（10と20）の「平均」である「15」を表示させよう。',
                initialCode: 'num1 = 10\nnum2 = 20\ntotal = num1 + num2\naverage = total / 3\nprint(average)',
                solution: 'total / 2',
                correctOutput: '15.0',
                buggyOutput: '10.0',
                hint: '2つの数の平均を出すには、合計を「2」で割る必要があります。このプログラムはエラーなく動きますが、計算のロジックが間違っているため、正しい結果になりません。'
            },
            {
                goal: '目的: 長方形の「面積」である「50」を表示させよう。',
                initialCode: 'width = 10\nheight = 5\narea = width + height\nprint(area)',
                solution: 'width * height',
                correctOutput: '50',
                buggyOutput: '15',
                hint: '長方形の面積は「縦 × 横」で計算します。プログラムでは `+` ではなく `*` を使います。'
            },
            // (他の論理エラー問題も同様の構造)
        ]
        // (各カテゴリに5問ずつ、同様のデータ構造で問題を追加)
    };

    const tabs = document.querySelectorAll('.tab');
    const challengeGoal = document.getElementById('challenge-goal');
    const codeEditor = document.getElementById('code-editor');
    const runBtn = document.getElementById('run-btn');
    const hintBtn = document.getElementById('hint-btn');
    const nextQBtn = document.getElementById('next-q-btn');
    const outputConsole = document.getElementById('output-console');
    const hintBox = document.getElementById('hint-box');
    const statusText = document.getElementById('status-text'); // ステータス表示用のp要素

    let currentType = 'syntax';
    let currentQuestion = {};

    function displayRandomQuestion(type) {
        const questions = allQuizData[type];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        challengeGoal.textContent = currentQuestion.goal;
        codeEditor.value = currentQuestion.initialCode;
        outputConsole.textContent = '';
        outputConsole.className = 'output-console';
        hintBox.style.display = 'none';
        hintBox.textContent = currentQuestion.hint;
        statusText.textContent = ''; // ステータスをリセット
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            displayRandomQuestion(currentType);
        });
    });

    // ▼▼▼【変更点2】実行ボタンのロジックを全面的に修正 ▼▼▼
    runBtn.addEventListener('click', () => {
        const code = codeEditor.value;
        outputConsole.className = 'output-console';
        statusText.textContent = '';
        let success = false;
        
        // 簡易的な正解判定
        if (currentType === 'syntax' || currentType === 'runtime') {
            success = currentQuestion.isCorrect(code);
        } else { // logical
            success = code.includes(currentQuestion.solution);
        }

        if (success) {
            statusText.textContent = '成功！目的通りの結果になりました！';
            statusText.style.color = '#27ae60';
            outputConsole.classList.add('success');
            outputConsole.textContent = currentQuestion.correctOutput;
        } else {
            if (currentType === 'syntax' || currentType === 'runtime') {
                statusText.textContent = 'エラーが発生しました';
                statusText.style.color = '#e74c3c';
                outputConsole.classList.add('error');
                outputConsole.textContent = currentQuestion.errorMessage;
            } else { // logical
                statusText.textContent = 'エラーはありませんが、結果が違います...';
                statusText.style.color = '#f39c12';
                outputConsole.textContent = currentQuestion.buggyOutput;
            }
        }
    });
    
    hintBtn.addEventListener('click', () => {
        hintBox.style.display = 'block';
    });

    nextQBtn.addEventListener('click', () => {
        displayRandomQuestion(currentType);
    });

    // 初期表示
    displayRandomQuestion(currentType);
});