document.addEventListener('DOMContentLoaded', () => {
    // 全50問の質問データ
    const allQuizData = [
        // 私的複製
        { scenario: '好きなアーティストのCDを買ってきて、自分のスマートフォンで聞くためにパソコンでコピーした。', answer: 'ok', explanation: '個人的にまたは家庭内で利用するための複製は「私的使用のための複製」として認められています。' },
        { scenario: '買ったばかりの漫画の最新刊を、クラスの友達全員（20人）に読ませてあげたくて、全ページをコピーして配った。', answer: 'ng', explanation: '「私的使用」は、ごく親しい間柄での利用が想定されています。学校のクラスの友達全員に配る行為は、この範囲を超えており、複製権の侵害にあたります。' },
        { scenario: 'レンタルしたDVDをコピーして、自分用に永久保存版のコレクションを作った。', answer: 'ng', explanation: 'コピーガード（技術的保護手段）が施されたDVDなどを、そのガードを外して複製することは、たとえ私的使用の目的でも違法となります。' },
        { scenario: 'Webサイトで見つけたきれいな風景写真をダウンロードして、自分のパソコンの壁紙にした。', answer: 'ok', explanation: 'ダウンロードも複製の一種ですが、個人的にデスクトップの壁紙として利用するだけであれば、私的使用の範囲内と認められます。' },
        // 同一性保持権
        { scenario: 'ネットで見つけたアニメキャラクターのイラストの色を少し変えて、自分のSNSのアイコンにした。', answer: 'ng', explanation: '著作者の許可なく著作物を改変することは、著作者人格権の一つである「同一性保持権」の侵害にあたる可能性があります。' },
        { scenario: '小説の一部を引用する際に、文章が長すぎたので、著者に無断で要約して掲載した。', answer: 'ng', explanation: '引用の範囲内であっても、著作者の意に反する改変は「同一性保持権」の侵害になる可能性があります。要約も改変の一種です。' },
        { scenario: 'ある楽曲の歌詞が不適切だと思ったので、一部を改変した替え歌を作って動画サイトで公開した。', answer: 'ng', explanation: '歌詞を無断で改変する行為は「同一性保持権」の侵害であり、それを公開する行為は「公衆送信権」の侵害にもあたります。' },
        // 営利を目的としない上演など
        { scenario: '学校の文化祭で、入場料を取らずにお客さんを楽しませるために、有名なJ-POPの曲をバンドで演奏した。', answer: 'ok', explanation: '営利を目的とせず、料金も取らない場合の上演や演奏は、著作権の例外規定として認められています。' },
        { scenario: '地域の公民館で無料の映画上映会を開き、レンタルした最新映画を上映した。', answer: 'ng', explanation: '非営利の上映であっても、市販のDVDなどをそのまま上映する権利は観客にはありません。「公衆上映権」の侵害となります。' },
        { scenario: '公園でギターを弾いていたら人が集まってきたので、有名アーティストの曲を数曲披露した。', answer: 'ok', explanation: '非営利で料金を取らない上演・演奏は認められています。ただし、投げ銭など実質的な料金が発生した場合はNGとなる可能性があります。' },
        // 引用
        { scenario: '自分のブログ記事で、あるニュース記事の内容を批評するために、その記事の一部を数行だけ抜き出して掲載し、出典元も明記した。', answer: 'ok', explanation: '公正な慣行に合致し、報道、批評、研究などの正当な目的の範囲内であれば「引用」として認められます。出典の明記も重要です。' },
        { scenario: '映画の感想ブログを書くにあたり、感想は「最高でした！」の一言だけにして、映画の結末のセリフをすべて文字起こしして掲載した。', answer: 'ng', explanation: '引用は、自分の文章が「主」で、引用部分が「従」の関係である必要があります。この場合、引用がメインとなっており、正当な引用の範囲を超えています。' },
        { scenario: 'Webサイトで見つけたグラフを、出典を書いた上で、自分のレポートにそのまま貼り付けた。', answer: 'ok', explanation: 'レポートなどで自分の説を補強するために、公表された著作物の一部を引用することは、出典を明記するなどの条件を満たせば認められます。' },
        { scenario: '好きな詩集の中から、特にお気に入りの詩を丸ごと一つ、自分のSNSに投稿した。', answer: 'ng', explanation: '詩のように短い著作物を丸ごと利用することは、たとえ出典を書いても「引用」の範囲を超える可能性が高いです。' },
        // 公衆送信権
        { scenario: 'テレビで放送されたドラマを録画し、その動画ファイルを動画共有サイトにアップロードした。', answer: 'ng', explanation: '著作物を不特定多数の人が受信できる状態にする「公衆送信権」の侵害にあたります。個人的な録画は私的使用の範囲ですが、アップロードは認められていません。' },
        { scenario: '自分で歌った有名曲のカバー動画を、許可なく動画サイトにアップロードした。', answer: 'ng', explanation: '楽曲には著作権があり、それをカバーして公開するには著作権者の許可が必要です。これは「演奏権」や「公衆送信権」に関わります。' },
        { scenario: '自分が契約している有料の動画配信サービスのアカウントを、友人に教えてあげて共有した。', answer: 'ng', explanation: '多くのサービスでは、アカウントの共有を規約で禁止しています。これは著作権法上の問題に加え、契約違反にもなります。' },
        // 教育機関での利用
        { scenario: '学校の英語の授業で、海外の有名な小説の一部を和訳し、その翻訳文を授業で発表した。', answer: 'ok', explanation: '教育機関における複製や公表は、授業の過程で必要な限度であれば認められています。ただし、著作権者の利益を不当に害する場合は除きます。' },
        { scenario: '高校の入学試験の英語の問題で、最近出版された小説の一節を長文読解問題として使用した。', answer: 'ok', explanation: '入学試験など、試験問題として著作物を利用することは、著作権の例外規定として認められています。' },
        { scenario: '授業で使うために、市販のドリルを1ページだけコピーして生徒に配布した。', answer: 'ok', explanation: '授業の過程で教員や生徒が必要な範囲で複製することは認められています。ただし、ドリル全体をコピーするような行為はNGです。' },
        // 図書館での複製
        { scenario: '図書館で借りた本を、勉強のために全ページをコピーして、自分だけの参考書を作った。', answer: 'ng', explanation: '図書館での複製は、著作物の一部分について、一人一部までと定められています。全ページをコピーすることは認められていません。' },
        { scenario: '国立国会図書館で、絶版になった古い雑誌の記事を1つだけ、調査研究のためにコピーしてもらった。', answer: 'ok', explanation: '図書館などでの複製は、調査研究目的で著作物の一部分を一人一部提供する場合に認められています。' },
        // CCライセンスとフリー素材
        { scenario: 'Webサイトで「CC BY」と表示されている写真を見つけた。作者の名前を書いて、自分のブログ記事に使った。', answer: 'ok', explanation: 'CCライセンスは、作者が表示した条件を守れば自由に利用できます。「BY」は原作者のクレジット表示を求めるものです。' },
        { scenario: '「商用利用可」と書かれたフリーイラストサイトの画像を、自分が作る有料の教材に使った。', answer: 'ok', explanation: '「商用利用可」と明記されていれば、金銭の発生する活動にも利用できます。ただし、サイトの利用規約はよく確認する必要があります。' },
        { scenario: 'フリー（無料）でダウンロードできる画像編集ソフトを、友人のUSBメモリにコピーしてあげた。', answer: 'ng', explanation: 'フリーソフトは無料で使用できますが、著作権が放棄されているわけではありません。作者の許可なく再配布（コピーして渡すこと）はできません。' },
        // 著作者人格権
        { scenario: '亡くなった小説家の未発表の原稿を、出版社が遺族の許可なく「幻の遺作」として出版した。', answer: 'ng', explanation: '著作物を公表するかどうかを決める「公表権」は著作者人格権の一つです。著作者の死後も、その意に反するような公表は原則として認められていません。' },
        { scenario: '有名な画家の絵を買って所有者になったので、絵の上に自分のサインを書き加えた。', answer: 'ng', explanation: 'たとえ著作物の所有者であっても、著作者の意に反して内容を改変することは「同一性保持権」の侵害になります。' },
        // 保護期間とパブリックドメイン
        { scenario: 'ベートーヴェン（1827年没）が作曲したクラシック音楽を、自作の動画のBGMとして利用した。', answer: 'ok', explanation: '著作権の保護期間は、著作者の死後70年です。ベートーヴェンの楽曲は著作権が消滅し、パブリックドメイン（社会の共有財産）となっているため自由に利用できます。' },
        { scenario: '1950年に公開された有名な白黒映画を、地域のイベントで上映した。', answer: 'ok', explanation: '映画の著作権の保護期間は、公表後70年です。1953年以前に公開された映画は、保護期間が満了しているため自由に利用できます。' },
        // 翻案権
        { scenario: '海外の歌の歌詞をすべて日本語に翻訳し、自分のブログで「和訳歌詞」として公開した。', answer: 'ng', explanation: '翻訳は「翻案権」という著作者の権利に含まれます。許可なく翻訳を公開することは、著作権侵害にあたる可能性があります。' },
        { scenario: '有名な小説を元にして、オリジナルの脚本を書き、文化祭で演劇として上演した。', answer: 'ng', explanation: '小説を演劇の脚本にすることは「翻案」にあたります。原作の著作権者の許可なく上演することは「翻案権」および「上演権」の侵害となります。' },
        // 複製権・頒布権
        { scenario: '好きな漫画のキャラクターを、自分でそっくりに描き写して、文化祭で売るキーホルダーのデザインにした。', answer: 'ng', explanation: '個人的に楽しむための模写（私的複製）は認められていますが、それを販売する行為は営利目的となり、複製権や頒 μπορεί権の侵害にあたります。' },
        // アイデア・表現二分論
        { scenario: 'ある小説の「時間を超える高校生」というアイデアだけを参考にして、全く違う登場人物、ストーリーの自作小説を書いた。', answer: 'ok', explanation: '著作権が保護するのは、具体的な「表現」であり、アイデアや設定そのものは保護の対象外です。これをアイデア・表現二分論といいます。' },
        // 映り込み
        { scenario: '街を歩きながら動画を撮影していたら、数秒間だけお店の看板に描かれたキャラクターが映り込んでしまった。', answer: 'ok', explanation: '写真撮影や録画の際に、意図せず背景に小さく著作物が入り込むことは「映り込み」として、例外的に認められています。' },
        // 著作隣接権
        { scenario: 'あるテレビ局が制作した音楽番組を、別のテレビ局が許可なく放送した。', answer: 'ng', explanation: 'テレビ局など、著作物を伝達する者には「著作隣接権」があります。放送事業者は、自分の放送を許可なく他者に放送させない権利を持っています。' },
        //その他
        { scenario: '市役所が発行した「ゴミの分別方法」についてのパンフレットを、町内会の掲示板にコピーして貼り出した。', answer: 'ok', explanation: '国や地方公共団体が作成した広報資料などは、転載禁止の表示がない限り、自由に転載することができます。' },
        { scenario: 'プログラムのソースコードも著作物として保護される。', answer: 'ok', explanation: 'コンピュータプログラムは、著作権法で保護される著作物の一種です。' },
        { scenario: '料理のレシピそのもの（材料と手順）は、著作権で保護される。', answer: 'ng', explanation: 'レシピは単なる事実の伝達やアイデアと見なされることが多く、創作的な「表現」とはいえないため、一般的に著作権では保護されません。' },
        { scenario: '自分で描いたイラストの著作権を、他人に売ることはできない。', answer: 'ng', explanation: '著作権のうち、財産的な権利である「著作権（財産権）」は、契約によって他人に譲渡（売買）したり、相続したりすることが可能です。' },
        { scenario: '著作権を侵害していると知りながら、違法にアップロードされた音楽をダウンロードした。', answer: 'ng', explanation: '違法にアップロードされたものであると知りながら音楽や映像をダウンロードする行為は、私的使用の目的であっても違法となります。' },
        { scenario: '学校のレポートで、Webサイトの文章をコピー＆ペーストし、少しだけ語尾を変えて自分の文章として提出した。', answer: 'ng', explanation: 'これは適切な「引用」とは言えず、著作権侵害にあたる可能性が高いです。また、学校のルールとしても剽窃（ひょうせつ）行為にあたります。' },
        { scenario: 'お気に入りの小説の朗読動画を作成し、動画サイトで公開した。', answer: 'ng', explanation: '小説を朗読して公開することは、著作権者の「口述権」や「公衆送信権」に関わります。許可なく行うことはできません。' },
        { scenario: 'SNSで友達が投稿したペットの写真を、無断で自分のスマホに保存した。', answer: 'ok', explanation: '友達の投稿をスクリーンショットなどで保存する行為は、個人的に楽しむ範囲であれば「私的使用のための複製」にあたります。ただし、それを再投稿すると問題になります。' },
        { scenario: '有名なロゴマークを少しだけ変えて、自分のサークルのTシャツデザインとして使った。', answer: 'ng', explanation: 'ロゴマークは著作権だけでなく、商標権でも保護されていることが多いです。無断で使用・改変すると、両方の権利を侵害する可能性があります。' },
        { scenario: '自分で撮った風景写真の著作権は、プロのカメラマンでない限り発生しない。', answer: 'ng', explanation: '著作権は、創作した時点で自動的に発生します。プロかどうかは関係なく、創作的な表現であれば誰でも著作者となり、権利を持ちます。' },
        { scenario: '夏休みの自由研究で、ある科学者の論文を参考にした。参考文献として論文名を最後に記載した。', answer: 'ok', explanation: '研究や学習のために他人の著作物を参考にし、参考文献として明記することは、学術的な作法として一般的であり、適切な行為です。' },
        { scenario: '「転載禁止」と書かれているニュースサイトの記事を、自分のブログに丸ごとコピーして掲載した。', answer: 'ng', explanation: '著作権者が明確に利用を禁止している場合、それを無視して利用することはできません。引用の範囲を大きく超える転載も著作権侵害です。' },
        { scenario: '自分が考えたキャラクターのデザインは、特許庁に出願しないと著作権で保護されない。', answer: 'ng', explanation: '著作権は、作品が創作された時点で自動的に発生する「無方式主義」です。特許や商標のような出願・登録手続きは必要ありません。' },
        { scenario: 'ある曲の楽譜を買って、ピアノの発表会でその曲を演奏した。', answer: 'ok', explanation: '楽譜の購入には、通常、個人的な練習や非営利の発表会での演奏といった利用が含まれています。' },
        { scenario: '友達が監督した自主制作映画を、許可を得て動画サイトで公開してあげた。', answer: 'ok', explanation: '著作権者本人（この場合は友達）から許可を得ていれば、その著作物をアップロード（公衆送信）することは問題ありません。' }
    ];

    const cardContainer = document.getElementById('card-container');
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // 配列をシャッフルする関数（Fisher-Yates shuffle）
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        // 全問題からランダムに5問選ぶ
        currentQuizSet = shuffle([...allQuizData]).slice(0, 5);
        displayQuestion(currentQuestionIndex);
    }

    function displayQuestion(index) {
        cardContainer.innerHTML = '';
        const q = currentQuizSet[index];

        const card = document.createElement('div');
        card.className = 'quiz-card';

        card.innerHTML = `
            <div class="question-number">第 ${index + 1} 問</div>
            <p class="scenario">${q.scenario}</p>
            <div class="answer-options">
                <button id="ok-btn">OK 👍</button>
                <button id="ng-btn">NG 👎</button>
            </div>
            <div class="explanation" style="display: none;"></div>
        `;
        
        cardContainer.appendChild(card);

        const okBtn = document.getElementById('ok-btn');
        const ngBtn = document.getElementById('ng-btn');
        const explanationDiv = card.querySelector('.explanation');

        okBtn.addEventListener('click', () => handleAnswer('ok', q.answer, q.explanation, explanationDiv, okBtn, ngBtn));
        ngBtn.addEventListener('click', () => handleAnswer('ng', q.answer, q.explanation, explanationDiv, okBtn, ngBtn));
    }

    function handleAnswer(userAnswer, correctAnswer, explanation, explanationDiv, okBtn, ngBtn) {
        okBtn.disabled = true;
        ngBtn.disabled = true;

        explanationDiv.style.display = 'block';

        if (userAnswer === correctAnswer) {
            score++;
            explanationDiv.classList.add('correct');
            explanationDiv.innerHTML = `<div class="result-text correct">正解！</div><p>${explanation}</p>`;
        } else {
            explanationDiv.classList.add('incorrect');
            explanationDiv.innerHTML = `<div class="result-text incorrect">不正解...</div><p>${explanation}</p>`;
        }
        
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        if (currentQuestionIndex < currentQuizSet.length - 1) {
            nextBtn.textContent = '次の問題へ';
            nextBtn.addEventListener('click', () => {
                currentQuestionIndex++;
                displayQuestion(currentQuestionIndex);
            });
        } else {
            nextBtn.textContent = '結果を見る';
            nextBtn.addEventListener('click', showFinalScore);
        }
        explanationDiv.appendChild(nextBtn);
    }

    function showFinalScore() {
        cardContainer.innerHTML = `
            <div id="score-container">
                <h2>クイズ終了！</h2>
                <div id="score-text">${currentQuizSet.length}問中 ${score}問 正解！</div>
                <button id="next-btn">もう一度挑戦する</button>
            </div>
        `;
        const retryBtn = document.getElementById('next-btn');
        retryBtn.addEventListener('click', startQuiz);
    }

    startQuiz(); // クイズを開始
});