document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const questionForm = document.getElementById('questionForm');
    const chapterSelect = document.getElementById('chapter');
    const tangenSelect = document.getElementById('tangen');
    const countSelect = document.getElementById('count');
    const generateButton = document.getElementById('generateButton');
    const outputArea = document.getElementById('outputArea');
    const statusMessage = document.getElementById('statusMessage');
    const errorMessage = document.getElementById('errorMessage');
    const questionTypeGroup = document.getElementById('questionTypeGroup');
    const questionTypeSelect = document.getElementById('questionType');
    const subTopicSelector = document.getElementById('subTopicSelector');
    const searchTopicSelector = document.getElementById('searchTopicSelector');
    const sortTopicSelector = document.getElementById('sortTopicSelector');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutButton = document.getElementById('logoutButton');

    // --- ログイン状態をチェックしてUIを更新 ---
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
    if (authData && authData.user) {
        // ログインしている場合：「ログアウト」ボタンのみ表示
        logoutButton.style.display = 'inline-block';
    } else {
        // ログアウトしている場合：「ログイン」「新規登録」リンクを表示
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
    }

    // --- ログアウト機能 ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supabase.auth.token');
        window.location.href = 'login.html';
    });

    // --- 認証済みAPIリクエストのためのヘッダーを生成するヘルパー関数 ---
    function getAuthHeaders() {
        const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
        if (!authData || !authData.session || !authData.session.access_token) {
            alert('セッションが切れました。再度ログインしてください。');
            window.location.href = 'login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.session.access_token
        };
    }

    // 初期状態の設定
    tangenSelect.disabled = true;
    questionTypeSelect.disabled = true;
    questionTypeSelect.innerHTML = '<option value="">問題種別を選択してください</option>';
    outputArea.innerHTML = '<p class="placeholder-text">ここに生成された問題が表示されます。</p>';

    // 章と単元のデータ
    const tangendata = {
        information_society: ["01 情報と情報社会","02 問題解決の考え方","03 法規による安全対策","04 個人情報とその扱い","05 知的財産権の概要と産業財産権","06 著作権"],
        information_design: ["07 コミュニケーションとメディア","08 情報デザインと表現の工夫","09 Webページと情報デザイン"],
        digital: ["10 デジタル情報の特徴","11 数値と文字の表現","12 演算の仕組み","13 音の表現","14 画像の表現","15 コンピュータの構成と動作","16 コンピュータの性能"],
        network:["17 ネットワークとプロトコル","18 インターネットの仕組み","19 Webページの閲覧とメールの送受信","20 情報システム","21 情報システムを支えるデータベース","22 データベースの仕組み","23 個人による安全対策","24 安全のための情報技術"],
        problem: ["25 データの収集と整理", "26 ソフトウェアを利用したデータの処理", "27 統計量とデータの尺度", "28 時系列分析と回帰分析", "29 モデル化とシミュレーション"],
        programing: ["30 アルゴリズムとプログラミング", "31 プログラミングの基本", "32 配列", "33 関数", "34 探索のプログラム","35 整列のプログラム"]
    };

    const programmingUnits = [ "31 プログラミングの基本", "32 配列", "33 関数", "34 探索のプログラム", "35 整列のプログラム" ];
    const binaryUnits = ["11 数値と文字の表現", "12 演算の仕組み"];
    const calculationUnits = ["27 統計量とデータの尺度"];

    const filePathMap = {
        "01 情報と情報社会": "/word/word1/word1_01.html", "02 問題解決の考え方": "/word/word1/word1_02.html", "03 法規による安全対策": "/word/word1/word1_03.html", "04 個人情報とその扱い": "/word/word1/word1_04.html", "05 知的財産権の概要と産業財産権": "/word/word1/word1_05.html", "06 著作権": "/word/word1/word1_06.html",
        "07 コミュニケーションとメディア": "/word/word2/word2_07.html", "08 情報デザインと表現の工夫": "/word/word2/word2_08.html", "09 Webページと情報デザイン": "/word/word2/word2_09.html",
        "10 デジタル情報の特徴": "/word/word3/word3_10.html", "11 数値と文字の表現": "/word/word3/word3_11.html", "12 演算の仕組み": "/word/word3/word3_12.html", "13 音の表現": "/word/word3/word3_13.html", "14 画像の表現": "/word/word3/word3_14.html", "15 コンピュータの構成と動作": "/word/word3/word3_15.html", "16 コンピュータの性能": "/word/word3/word3_16.html",
        "17 ネットワークとプロトコル": "/word/word4/word4_17.html","18 インターネットの仕組み": "/word/word4/word4_18.html", "19 Webページの閲覧とメールの送受信": "/word/word4/word4_19.html", "20 情報システム": "/word/word4/word4_20.html", "21 情報システムを支えるデータベース": "/word/word4/word4_21.html", "22 データベースの仕組み": "/word/word4/word4_22.html", "23 個人による安全対策": "/word/word4/word4_23.html", "24 安全のための情報技術": "/word/word4/word4_24.html",
        "25 データの収集と整理": "/word/word5/word5_25.html", "26 ソフトウェアを利用したデータの処理": "/word/word5/word5_26.html", "27 統計量とデータの尺度": "/word/word5/word5_27.html", "28 時系列分析と回帰分析": "/word/word5/word5_28.html", "29 モデル化とシミュレーション": "/word/word5/word5_29.html",
        "30 アルゴリズムとプログラミング": "/word/word6/word6_30.html", "31 プログラミングの基本": "/word/word6/word6_31.html", "32 配列": "/word/word6/word6_32.html", "33 関数": "/word/word6/word6_33.html", "34 探索のプログラム": "/word/word6/word6_34.html", "35 整列のプログラム": "/word/word6/word6_35.html"
    };
    
    const promptMap = {
        "33 関数": "`def`キーワードを使ってユーザーが独自に定義する「ユーザー定義関数」のプログラム問題を作成してください。引数や戻り値（return）の有無など、様々なパターンの問題を生成してください。",
        "32 配列": "配列の要素を追加する`append`、要素を削除する`del`や`pop`、配列の長さを調べる`len`など、多様な操作に関する問題を作成してください。",
        "25 データの収集と整理": "1次データと2次データの違いに関する問題を作成してください。例えば、「調査によって直接集められた生データ」はどちらに該当するか、といった形式の問題が望ましいです。"
    };

    chapterSelect.addEventListener('change', function() {
        const selectedChapter = this.value;
        tangenSelect.innerHTML = '<option value="">単元を選択してください</option>';
        questionTypeSelect.innerHTML = '<option value="">問題種別を選択してください</option>';
        tangenSelect.disabled = true;
        questionTypeSelect.disabled = true;
        subTopicSelector.style.display = 'none';
        searchTopicSelector.style.display = 'none';
        sortTopicSelector.style.display = 'none';

        if (selectedChapter) {
            tangenSelect.disabled = false;
            tangendata[selectedChapter].forEach(tangen => {
                const option = document.createElement('option');
                option.value = tangen;
                option.textContent = tangen;
                tangenSelect.appendChild(option);
            });
        }
    });

    tangenSelect.addEventListener('change', function() {
        const selectedTangen = this.value;
        questionTypeSelect.innerHTML = '<option value="">問題種別を選択してください</option>';
        questionTypeSelect.disabled = true;
        subTopicSelector.style.display = 'none';
        searchTopicSelector.style.display = 'none';
        sortTopicSelector.style.display = 'none';

        if (selectedTangen) {
            questionTypeSelect.disabled = false;
            const knowledgeOption = document.createElement('option');
            knowledgeOption.value = 'knowledge';
            knowledgeOption.textContent = '知識問題';
            questionTypeSelect.appendChild(knowledgeOption);

            if (programmingUnits.includes(selectedTangen)) {
                const programmingOption = document.createElement('option');
                programmingOption.value = 'programming';
                programmingOption.textContent = 'プログラム作成問題';
                questionTypeSelect.appendChild(programmingOption);
            }

            if (binaryUnits.includes(selectedTangen)) {
                const binaryOption = document.createElement('option');
                binaryOption.value = 'binary';
                binaryOption.textContent = '進数問題';
                questionTypeSelect.appendChild(binaryOption);
            }

            if (calculationUnits.includes(selectedTangen)) {
                const calculationOption = document.createElement('option');
                calculationOption.value = 'calculation';
                calculationOption.textContent = '計算問題';
                questionTypeSelect.appendChild(calculationOption);
            }
            
            if (selectedTangen === "31 プログラミングの基本") {
                subTopicSelector.style.display = 'block';
            }
            if (selectedTangen === "34 探索のプログラム") {
                searchTopicSelector.style.display = 'block';
            }
            if (selectedTangen === "35 整列のプログラム") {
                sortTopicSelector.style.display = 'block';
            }
        }
    });
    
    function parseStructuredText(text) {
        const questionsData = [];
        if (!text) return questionsData;
        const questionBlocks = text.split('===QUESTION===');

        for (const block of questionBlocks) {
            if (block.trim() === '') continue;
            const parts = block.split(/---(ANSWER|DISTRACTORS|EXPLANATION)---/);
            const question = parts[0] ? parts[0].trim() : '';
            const correctAnswer = parts[2] ? parts[2].trim() : '';
            const distractorsText = parts[4] ? parts[4].trim() : '';
            const explanation = parts[6] ? parts[6].trim() : '';

            let distractors = [];
            if (distractorsText.includes(';;;')) {
                distractors = distractorsText.split(';;;').map(d => d.trim()).filter(d => d !== '');
            } else if (distractorsText.includes('\n\n')) {
                 distractors = distractorsText.split(/\n\s*\n/).map(d => d.trim()).filter(d => d !== '');
            } else {
                distractors = distractorsText.split('\n').map(d => d.trim()).filter(d => d !== '');
            }
            questionsData.push({ question, correctAnswer, distractors, explanation });
        }
        return questionsData;
    }

    questionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const startTime = performance.now();
        
        const chapter = chapterSelect.value;
        const tangen = tangenSelect.value;
        const count = countSelect.value;
        const questionType = questionTypeSelect.value;

        if (!chapter || !tangen || !count || !questionType) {
            errorMessage.textContent = '章、単元、問題種別、問題数をすべて選択してください。';
            return;
        }

        statusMessage.textContent = '準備中...';
        errorMessage.textContent = '';
        outputArea.innerHTML = '<p class="placeholder-text">AIが問題を生成しています……</p>';
        generateButton.disabled = true;

        try {
            let referenceContent = '';
            const filePath = filePathMap[tangen];
            if (filePath) {
                statusMessage.textContent = '参考資料を読み込んでいます...';
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`参考資料ファイル（${filePath}）の読み込みに失敗しました。`);
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                referenceContent = doc.body.innerText.trim();
            }
            
            statusMessage.textContent = 'AIに問題を生成依頼中...';

            let promptText = '';
            const isProgrammingQuestion = programmingUnits.includes(tangen) && questionType === 'programming';
            const isPredictOutputQuestion = tangen === "32 配列" && isProgrammingQuestion;
            const isBinaryQuestion = binaryUnits.includes(tangen) && questionType === 'binary';
            const isCalculationQuestion = calculationUnits.includes(tangen) && questionType === 'calculation';
            
            let topicInstruction = '';
            if (tangen === "31 プログラミングの基本") {
                const checkedSubTopics = Array.from(document.querySelectorAll('#subTopicSelector input:checked')).map(cb => cb.value);
                if (checkedSubTopics.length > 0) {
                    topicInstruction = `作成するプログラムには、以下の概念を必ず含めてください：${checkedSubTopics.join('、')}。`;
                    if (checkedSubTopics.some(topic => topic.includes('選択構造'))) {
                        topicInstruction += `\n- **選択構造(if文)の問題では、if文の条件式部分、ifブロック内の処理、あるいはelifやelseの処理など、様々な部分を@@で囲んでください。**`;
                    }
                } else {
                    topicInstruction = '作成するプログラムには、「順次構造」「選択構造」「反復構造」のいずれかの概念を含めてください。';
                }
            } else if (tangen === "34 探索のプログラム") {
                const checkedSearchTopics = Array.from(document.querySelectorAll('#searchTopicSelector input:checked')).map(cb => cb.value);
                if (checkedSearchTopics.length > 0) {
                    topicInstruction = `作成するプログラムは、以下のアルゴリズムに焦点を当ててください：${checkedSearchTopics.join('、')}`;
                } else {
                    topicInstruction = '作成するプログラムは、「線形探索」または「二分探索」のいずれかのアルゴリズムに焦点を当ててください。';
                }
            } else if (tangen === "35 整列のプログラム") {
                const checkedSortTopics = Array.from(document.querySelectorAll('#sortTopicSelector input:checked')).map(cb => cb.value);
                if (checkedSortTopics.length > 0) {
                    topicInstruction = `作成するプログラムは、以下の整列アルゴリズムに焦点を当ててください：${checkedSortTopics.join('、')}`;
                } else {
                    topicInstruction = '作成するプログラムは、「交換法」または「選択法」のいずれかの整列アルゴリズムに焦点を当ててください。';
                }
            }

            if (isProgrammingQuestion && topicInstruction === '') {
                topicInstruction = `参考情報に基づいて、この単元「${tangen}」に関連するプログラム問題を作成してください。`;
            }
            
            const customInstruction = promptMap[tangen] || '';
            const baseInstructions = `
以下の区切り文字を厳守して、各パートを生成してください。
- 各問題の始まりは必ず ===QUESTION=== で開始してください。
- 問題文の次は ---ANSWER--- で区切り、正解を1つだけ記述してください。
- 正解の次は ---DISTRACTORS--- で区切り、不正解の選択肢を記述してください。
- 最後に ---EXPLANATION--- で区切り、解説を記述してください。
- **最重要ルール：解説(EXPLANATION)は、必ず丁寧な日本語で記述してください。**`;

            if (isCalculationQuestion) {
                promptText = `【指示】\n参考情報に基づき、「統計量」（平均値、中央値、最頻値、範囲など）に関する**計算問題のみ**を、指定のテキスト形式で${count}問作成してください。\n${baseInstructions}\n
【計算問題のルール】
- 問題文(QUESTION)は、「5つのデータ [10, 20, 10, 50, 30] の中央値はどれか」といった具体的な計算問題にしてください。
- ---ANSWER--- には、計算の正しい答えを記述してください。
- ---DISTRACTORS--- には、間違っているが、もっともらしい計算結果を3つ、改行で区切って記述してください。
\n---\n【参考情報】\n${referenceContent}`;
            } else if (tangen === "11 数値と文字の表現" && isBinaryQuestion) {
                promptText = `【指示】\n参考情報に基づき、「10進数と2進数の相互変換」「補数」に関する**計算問題のみ**を、指定のテキスト形式で${count}問作成してください。\n${baseInstructions}\n
【進数問題のルール】
- 問題文(QUESTION)は、**必ず具体的な計算問題**にしてください。用語の定義を問う知識問題は作らないでください。
- ---ANSWER--- には、計算の正しい答えを記述してください。（例: 1101, 1001 など）
- ---DISTRACTORS--- には、間違っているが、もっともらしい計算結果を3つ、改行で区切って記述してください。
\n---\n【参考情報】\n${referenceContent}`;
            } else if (tangen === "12 演算の仕組み" && isBinaryQuestion) {
                promptText = `【指示】\n参考情報に基づき、「2進数の加算（足し算）」または「2進数の減算（引き算）」に関する**計算問題のみ**を、指定のテキスト形式で${count}問作成してください。\n${baseInstructions}\n
【進数問題のルール】
- 問題文(QUESTION)は、**必ず具体的な計算問題**にしてください。論理回路や用語の定義を問う知識問題は作らないでください。
- ---ANSWER--- には、正しい答えを記述してください。
- ---DISTRACTORS--- には、間違っているが、もっともらしい答えを3つ、改行で区切って記述してください。
\n---\n【参考情報】\n${referenceContent}`;
            } else if (isPredictOutputQuestion) {
                promptText = `【指示】\n参考情報に基づき、**実行結果を選択させる形式の**Pythonプログラム問題を、指定のテキスト形式で${count}問作成してください。\n${baseInstructions}\n
【実行結果予測問題の重要ルール】
- **最重要ルール：問題文(QUESTION)の中には、@@記号は含めないでください。**
- 問題文(QUESTION)には、**実行すると明確な出力が1つだけある、完成したプログラムコード**を記述してください。**穴埋め形式にはしないでください。**
- **プログラムコード内には、最終的な実行結果を示すコメント以外、いかなる説明コメントも記述しないでください。**
- ${customInstruction}
- ---ANSWER--- には、**そのプログラムを実行した際の正しい出力結果**を記述してください。（例: 12, "hello", [1, 3, 5]など）
- ---DISTRACTORS--- には、**間違っているが、もっともらしい出力結果**を3つ、`;;;`で区切って記述してください。
\n---\n【参考情報】\n${referenceContent}`;
            } else if (isProgrammingQuestion) {
                promptText = `【指示】\n参考情報に基づき、指定されたテキスト形式で、**穴埋め形式の**Pythonプログラム問題を${count}問作成してください。\n${baseInstructions}\n
【プログラム問題の最重要ルール】
- **最重要ルール：問題文(QUESTION)の中には、必ず1箇所だけ、解答となる部分を @@ で囲んでください。(例: @@解答部分@@ のように、必ず開始と終了の両方に記号が必要です)**
- **必ず、プログラム全体を作成し、その中の一部分を@@で囲んで穴埋め問題にする形式**を守ってください。**文章でプログラムの作成を依頼する問題は絶対に作らないでください。**
- **プログラムコード内には、最終的な実行結果を示すコメント以外、いかなる説明コメントも記述しないでください。**
- ${topicInstruction}
- ${customInstruction}
- ---ANSWER--- には、**@@で囲んだ一行のコード片だけ**を記述してください。プログラム全体や、空欄の前にある変数名などは絶対に含めないでください。
- ---DISTRACTORS--- には、正解に似た**一行のコード片**を3つ、`;;;`で区切って記述してください。プログラム全体や変数名など、余計なものを含めないでください。
- 正解(ANSWER)や不正解の選択肢(DISTRACTORS)には、絶対に@@記号を含めないでください。
\n---\n【参考情報】\n${referenceContent}`;
            } else {
                promptText = `【指示】\n「${tangen}」に関する**知識問題**を指定のテキスト形式で${count}問作成してください。\n
【知識問題の厳密な定義とルール】
- **知識問題とは、用語の定義を問う問題や、説明文に当てはまる用語を選択させる問題形式です。**
- **問題文(QUESTION)は、必ず選択肢から答えを一つ選べるような質問形式（例：「〜とは何ですか？」、「〜に当てはまるものはどれですか？」）にしてください。**
- **絶対に、Python等のプログラムコードの断片を問題文や選択肢に含め、その動作や結果を予測させる問題を作成しないでください。**

【良い知識問題の例】
===QUESTION===
定められた一連の処理を定義し、それを呼び出すと一連の処理が実行される仕組みを何と呼びますか？
---ANSWER---
関数
---DISTRACTORS---
変数
引数
戻り値
---EXPLANATION---
関数は、特定の処理をまとめて名前を付けたものです。

\n${baseInstructions}\n
- **最重要ルール：問題文(QUESTION)の中には、必要に応じて解答となる部分を @@ で囲んで穴埋め問題にしても構いません。**
- ${customInstruction}
- 不正解の選択肢は、改行で3つ区切って記述してください。
\n---\n【参考情報】\n${referenceContent}`;
            }

            const generatedText = await fetchFromProxy(promptText);
            const questionsData = parseStructuredText(generatedText);
            
            if (questionsData.length === 0) {
                throw new Error("AIから有効な形式の問題を生成できませんでした。");
            }

            outputArea.innerHTML = ''; 
            questionsData.forEach((q, index) => {
                const choices = [q.correctAnswer, ...q.distractors].sort(() => Math.random() - 0.5);
                const questionBlock = document.createElement('div');
                questionBlock.className = 'question-block';
                questionBlock.dataset.correctAnswer = q.correctAnswer;
                questionBlock.dataset.explanation = q.explanation;
                
                if (isCalculationQuestion) {
                    const questionText = q.question;
                    questionBlock.innerHTML += `<p class="question-text"><b>問題 ${index + 1}:</b> ${questionText}</p>`;
                } else if (isBinaryQuestion) {
                    const questionText = q.question;
                    questionBlock.innerHTML += `<p class="question-text"><b>問題 ${index + 1}:</b> ${questionText}</p>`;
                } else if (isPredictOutputQuestion) {
                    const fullContent = q.question;
                    const cleanedContent = fullContent.replace(/^```(?:\w*\n)?/g, '').replace(/```$/g, '').trim();
                    const escapedCode = escapeHtml(cleanedContent); 
                    const questionTitle = '以下のプログラムを実行した結果として正しいものを選択してください。';
                    questionBlock.innerHTML += `<p class="question-text"><b>問題 ${index + 1}:</b> ${questionTitle}</p><pre><code>${escapedCode}</code></pre>`;
                } else if (isProgrammingQuestion) {
                    const fullContent = q.question;
                    const cleanedContent = fullContent.replace(/^```(?:\w*\n)?/g, '').replace(/```$/g, '').trim();
                    const escapedCode = escapeHtml(cleanedContent).replace(/@@(.*?)@@/g, '<span style="background-color: #ffff0040;">（　　）</span>');
                    const questionTitle = '以下のプログラムの空欄に当てはまるものを選択してください。';
                    questionBlock.innerHTML += `<p class="question-text"><b>問題 ${index + 1}:</b> ${questionTitle}</p><pre><code>${escapedCode}</code></pre>`;
                } else {
                    const questionText = q.question.replace(/@@(.*?)@@/g, '（　　）');
                    questionBlock.innerHTML += `<p class="question-text"><b>問題 ${index + 1}:</b> ${questionText}</p>`;
                }

                const choicesHtml = choices.map(choice => `<label><input type="radio" name="question-${index}" value="${escapeHtml(choice)}"><code>${escapeHtml(choice)}</code></label>`).join('');
                questionBlock.innerHTML += `<div class="choices">${choicesHtml}</div>`;
                questionBlock.innerHTML += `<div class="result-area"></div>`;
                outputArea.appendChild(questionBlock);
            });
            
            if (questionsData.length > 0) {
                const submitButton = document.createElement('button');
                submitButton.id = 'submitAnswersBtn';
                submitButton.textContent = '解答する';
                outputArea.appendChild(submitButton);

                submitButton.addEventListener('click', async () => {
                    const allQuestionBlocks = document.querySelectorAll('.question-block');
                    let correctCount = 0;
                    
                    const chapterName = chapterSelect.options[chapterSelect.selectedIndex].text;
                    const tangenName = tangenSelect.value;
                    const questionTypeText = questionTypeSelect.options[questionTypeSelect.selectedIndex].text;

                    const answeredResults = [];
                    allQuestionBlocks.forEach((block, index) => {
                        const resultArea = block.querySelector('.result-area');
                        const selectedRadio = block.querySelector(`input:checked`);
                        const userAnswer = selectedRadio ? selectedRadio.value : null;
                        const correctAnswer = block.dataset.correctAnswer;
                        const explanation = block.dataset.explanation;

                        let isCorrect = false;
                        if (userAnswer === correctAnswer) {
                            resultArea.innerHTML = `<p class="correct">正解！</p><p class="explanation">${explanation}</p>`;
                            correctCount++;
                            isCorrect = true;
                        } else {
                            resultArea.innerHTML = `<p class="incorrect">不正解... 正しい答えは「<b>${correctAnswer}</b>」です。</p><p class="explanation">${explanation}</p>`;
                        }
                        answeredResults.push(isCorrect);

                        const saveButton = document.createElement('button');
                        saveButton.textContent = 'この問題を保存する';
                        saveButton.className = 'save-button';
                        
                        saveButton.addEventListener('click', async () => {
                            const headers = getAuthHeaders();
                            if (!headers) return;

                            const questionToSave = {
                                ...questionsData[index],
                                chapter: chapterName,
                                tangen: tangenName,
                                type: questionTypeText,
                                correct_answer: questionsData[index].correctAnswer,
                                wasCorrect: answeredResults[index]
                            };
                            
                            try {
                                const response = await fetch('/api/saved-questions', {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify(questionToSave)
                                });
                                if (!response.ok) throw new Error('保存に失敗しました。');
                                
                                saveButton.textContent = '保存済み ✓';
                                saveButton.disabled = true;
                            } catch (error) {
                                alert(error.message);
                            }
                        });

                        resultArea.appendChild(saveButton);
                    });

                    try {
                        const headers = getAuthHeaders();
                        if (headers) {
                            await fetch('/api/scores', {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify({
                                    chapter: chapterName,
                                    tangen: tangenName,
                                    type: questionTypeText,
                                    correct: correctCount,
                                    total: allQuestionBlocks.length
                                })
                            });
                        }
                    } catch (error) {
                        console.error('成績の保存に失敗:', error);
                    }

                    submitButton.disabled = true;
                    const finalResult = document.createElement('h3');
                    finalResult.className = 'final-result';
                    finalResult.textContent = `結果: ${allQuestionBlocks.length}問中 ${correctCount}問正解`;
                    outputArea.appendChild(finalResult);
                });
            }
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            statusMessage.textContent = `問題の準備ができました。（生成時間: ${duration.toFixed(2)}秒）`;

        } catch (error) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            console.error('問題生成エラー:', error);
            errorMessage.textContent = `問題の生成中にエラーが発生しました: ${error.message}（処理時間: ${duration.toFixed(2)}秒）`;
        } finally {
            generateButton.disabled = false;
        }
    });
});

async function fetchFromProxy(promptString) {
    const proxyUrl = '/api/gemini'; 
    const response = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptString }) 
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`サーバーエラー: ${response.status} - ${errorData.error || response.statusText}`);
    }
    const result = await response.json();
    return result; 
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}