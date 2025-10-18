require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabaseクライアントを初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// ▼▼▼【ここから追加】ルートURL('/')へのリクエストでregister.htmlを返す ▼▼▼
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});
// ▲▲▲【追加ここまで】▲▲▲

// 静的ファイルの配信設定
app.use(express.static(__dirname));
app.use('/word', express.static(path.join(__dirname, 'word')));
app.use(express.static(path.join(__dirname, '..')));

// --- ユーザー認証API ---
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    if (data.user) {
        const { error: insertError } = await supabase.from('users').insert([{ id: data.user.id, username: username }]);
        if (insertError) return res.status(500).json({ error: 'ユーザー情報の保存に失敗しました。' });
    }
    res.status(200).json(data);
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
});

// --- 認証済みユーザー情報を取得するヘルパー関数 ---
async function getUser(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return { user: null, error: 'Authorization header is missing' };
    
    const token = authHeader.split(' ')[1];
    if (!token) return { user: null, error: 'Token is missing' };

    const { data: { user }, error } = await supabase.auth.getUser(token);
    return { user, error };
}

// --- 成績データ用API ---
app.get('/api/scores', async (req, res) => {
    const { user, error } = await getUser(req);
    if (error || !user) return res.status(401).json({ error: '認証に失敗しました。' });

    const { data, error: dbError } = await supabase.from('scores').select('*').eq('user_id', user.id);
    if (dbError) return res.status(500).json({ error: '成績の取得に失敗しました。' });
    res.status(200).json(data);
});

app.post('/api/scores', async (req, res) => {
    const { user, error } = await getUser(req);
    if (error || !user) return res.status(401).json({ error: '認証に失敗しました。' });

    const { chapter, tangen, type, correct, total } = req.body;

    const { data: existingScore, error: selectError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('chapter', chapter)
        .eq('tangen', tangen)
        .eq('type', type)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        return res.status(500).json({ error: '成績の確認に失敗しました。' });
    }

    if (existingScore) {
        const newCorrect = existingScore.correct + correct;
        const newTotal = existingScore.total + total;
        const { error: updateError } = await supabase
            .from('scores')
            .update({ correct: newCorrect, total: newTotal })
            .eq('id', existingScore.id);
        
        if (updateError) return res.status(500).json({ error: '成績の更新に失敗しました。' });
    } else {
        const { error: insertError } = await supabase
            .from('scores')
            .insert([{ user_id: user.id, chapter, tangen, type, correct, total }]);
        
        if (insertError) return res.status(500).json({ error: '成績の保存に失敗しました。' });
    }
    
    res.status(200).send();
});

// --- 保存済み問題データ用API ---
app.get('/api/saved-questions', async (req, res) => {
    const { user, error } = await getUser(req);
    if (error || !user) return res.status(401).json({ error: '認証に失敗しました。' });

    const { data, error: dbError } = await supabase.from('saved_questions').select('*').eq('user_id', user.id);
    if (dbError) return res.status(500).json({ error: '保存済み問題の取得に失敗しました。' });
    res.status(200).json(data);
});

app.post('/api/saved-questions', async (req, res) => {
    const { user, error } = await getUser(req);
    if (error || !user) return res.status(401).json({ error: '認証に失敗しました。' });

    const { question, correct_answer, distractors, explanation, chapter, tangen, type, wasCorrect } = req.body;
    const { error: dbError } = await supabase.from('saved_questions').insert([
        { user_id: user.id, question, correct_answer, distractors, explanation, chapter, tangen, type, wasCorrect }
    ]);
    if (dbError) {
        console.error('Supabase insert error:', dbError);
        return res.status(500).json({ error: '問題の保存に失敗しました。' });
    }
    res.status(200).send();
});

app.delete('/api/saved-questions', async (req, res) => {
    const { user, error } = await getUser(req);
    if (error || !user) return res.status(401).json({ error: '認証に失敗しました。' });
    
    const { id } = req.body;
    let query = supabase.from('saved_questions').delete().eq('user_id', user.id);
    if (id) {
        query = query.eq('id', id);
    }

    const { error: dbError } = await query;
    if (dbError) return res.status(500).json({ error: '問題の削除に失敗しました。' });
    res.status(200).send();
});

// --- 問題生成API ---
app.post('/api/gemini', async (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ error: 'Gemini APIキーがサーバーに設定されていません。' });
    }
    
    const { prompt: userPrompt, model: selectedModel } = req.body;
    if (!userPrompt) {
        return res.status(400).json({ error: 'プロンプトが提供されていません。' });
    }

    let modelName = 'models/gemini-flash-latest'; // デフォルトはflash
    if (selectedModel === 'pro') {
        modelName = 'models/gemini-pro-latest';
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${geminiApiKey}`;
    
    const body = {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
    };

    try {
        const geminiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            try {
                const errorJson = JSON.parse(errorText);
                const message = errorJson.error?.message || 'Gemini APIからエラーが返されました。';
                throw new Error(message);
            } catch (e) {
                throw new Error(`Gemini APIから予期しない形式(HTML等)のエラーが返されました。ステータス: ${geminiResponse.status}`);
            }
        }

        const data = await geminiResponse.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        res.json(responseText);

    } catch (err) {
        console.error('プロキシサーバーでエラーが発生:', err);
        res.status(500).json({ error: err.message || 'プロキシサーバーで不明なエラーが発生しました。' });
    }
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`プロキシサーバーがポート ${PORT} で起動しました。`);
    console.log(`アクセス: http://localhost:${PORT}`);
});