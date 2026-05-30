// Sin dependencias externas — usa fetch nativo de Node 18+
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_IDENTITY = `You are the central AI engine for "Sinergia Familiar Language Hub", a high-speed serverless language immersion application. Your sole objective is to process backend requests and return ultra-precise responses without syntax failures.

Adopt an analytical, critical and conservative profile: under no circumstances invent fields, add plain text, greetings, or Markdown code blocks (such as \`\`\`json ... \`\`\`) outside the expected JSON object. Any deviation will break the client's JSON.parse().

Critical validation rules:
- Never use improperly escaped special characters that could break the JSON string.
- Ensure all Markdown formatting is removed before emitting the response.
- Return ONLY the raw JSON object, nothing else.`;

const KIDS_CONTEXTS = [
  'a pet shop looking at animals',
  'a birthday party choosing food',
  'a playground with new friends',
  'a classroom learning colours',
  'a supermarket picking fruit',
  'a zoo watching animals',
  'a toy shop choosing a toy',
  'a beach building a sandcastle'
];

const ADULT_CONTEXTS = [
  'airport check-in counter',
  'hotel reception desk',
  'taxi ride from the airport to the city',
  'international restaurant, waiter taking the order',
  'shopping mall, staff helping find a product',
  'pharmacy asking for medicine or sunscreen',
  'customs and immigration at the airport',
  'tourist information desk',
  'lost luggage counter at the airport',
  'rooftop bar ordering drinks',
  'currency exchange counter',
  'asking a local for directions on the street',
  'hotel concierge asking for restaurant tips',
  'corporate logistics briefing with an international partner',
  'energy market risk assessment meeting',
  'international retail inventory control session'
];

const LEVEL_GUIDE = {
  'Starter':           'Use ONLY single words or max 2-word phrases. Very slow. Ultra friendly. Visual and playful.',
  'Elementary':        'Short simple sentences (max 6 words). Speak slowly. Very common vocabulary. Encouraging.',
  'Pre-Intermediate':  'Moderate pace. Common travel phrases. Patient and encouraging.',
  'Intermediate':      'Normal conversational pace. Standard vocabulary.',
  'Upper-Intermediate':'Natural pace with occasional idioms. Some complexity expected.',
  'Advanced':          'Native speed. Rich vocabulary, idioms, and nuance. No simplification. Demand structural precision.'
};

const IS_KIDS_LEVEL = level => ['Starter', 'Elementary'].includes(level);

function extraerJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in Gemini response: ' + text.slice(0, 200));
  return JSON.parse(match[0]);
}

async function llamarGemini(apiKey, systemPrompt, userPrompt, maxTokens = 1024) {
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
  };
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const candidate = data.candidates && data.candidates[0];
  if (!candidate || !candidate.content) {
    const reason = candidate && candidate.finishReason ? candidate.finishReason : 'NO_CANDIDATE';
    throw new Error('Gemini did not return content. Reason: ' + reason);
  }
  return candidate.content.parts[0].text.trim();
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY in Vercel environment.' });

  try {
    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};
    const levelKey   = level || 'Pre-Intermediate';
    const levelGuide = LEVEL_GUIDE[levelKey] || LEVEL_GUIDE['Pre-Intermediate'];
    const isKids     = IS_KIDS_LEVEL(levelKey);

    if (action === 'generate_scenario') {
      const pool    = isKids ? KIDS_CONTEXTS : ADULT_CONTEXTS;
      const context = pool[Math.floor(Math.random() * pool.length)];
      const prompt  = isKids
        ? `Setting: ${context}. You are a friendly character in this simple, visual scene.
The child's English level is ${levelKey}. ${levelGuide}
Open the scene with ONE very short, friendly line (max 6 words). Simple and fun.
Reply ONLY with this raw JSON object:
{"setup_title": "título corto en español", "ai_opening": "your short opening in English", "ai_opening_translation": "traducción al español"}`
        : `Setting: ${context}. You are a professional in this high-speed real-world scenario.
The user's English level is ${levelKey}. ${levelGuide}
Open the scene with ONE natural, professional line adapted to the level.
Reply ONLY with this raw JSON object:
{"setup_title": "título corto en español", "ai_opening": "your opening line in English", "ai_opening_translation": "traducción al español"}`;

      const text = await llamarGemini(apiKey, SYSTEM_IDENTITY, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    if (action === 'generate_shadowing') {
      const pool    = isKids ? KIDS_CONTEXTS : ADULT_CONTEXTS;
      const context = pool[Math.floor(Math.random() * pool.length)];
      const prompt  = `Setting: ${context}. Level: ${levelKey}. ${levelGuide}
Write a 6-line dialogue (staff/traveler alternating, staff first). Keep each line under 12 words. Translations must be brief.
Return ONLY this JSON (no extra text):
{"title":"título en español","context":"${context}","lines":[{"role":"staff","text":"...","translation":"..."},{"role":"traveler","text":"...","translation":"..."},{"role":"staff","text":"...","translation":"..."},{"role":"traveler","text":"...","translation":"..."},{"role":"staff","text":"...","translation":"..."},{"role":"traveler","text":"...","translation":"..."}]}`;
      const text = await llamarGemini(apiKey, SYSTEM_IDENTITY, prompt, 4096);
      return res.status(200).json(extraerJSON(text));
    }

    if (action === 'evaluate_shadowing') {
      const { expected } = req.body;
      const prompt = `The traveler (level ${levelKey}) was supposed to say: "${expected}"
They actually said: "${textInput || ''}"
Rate phonetic accuracy and structural closeness. ${isKids ? 'Be very encouraging.' : 'Be constructive and precise.'}
Score: 100 if perfect or very close, 70 if mostly right with small errors, 40 if partially correct, 10 if very different.
Reply ONLY with this raw JSON object:
{"score": 70, "feedback": "comentario breve y alentador en español", "tip": "one word or phrase to practice, or empty string if perfect"}`;
      const text = await llamarGemini(apiKey, SYSTEM_IDENTITY, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    if (action === 'generate_story') {
      const prompt = `Generate a short English reading passage for a language learner at level ${levelKey}.
${levelGuide}
Write 4 to 6 natural sentences. Make it engaging and thematically relevant to travel or daily life.
For lower levels (Starter/Elementary): use very simple vocabulary, short sentences, familiar words.
For higher levels: use natural sentence variety, idioms where appropriate, and richer vocabulary.
Reply ONLY with this raw JSON object:
{"title": "título del texto en español", "text": "The full English passage here as one continuous string. Four to six sentences."}`;
      const text = await llamarGemini(apiKey, SYSTEM_IDENTITY, prompt, 1024);
      return res.status(200).json(extraerJSON(text));
    }

    if (action === 'evaluate_voice') {
      const strictness = isKids
        ? 'Prioritise fluency and approximate phonetics. Be very encouraging. Accept near-correct answers.'
        : levelKey === 'Advanced'
          ? 'Demand structural precision, correct idiom usage, and native-level coherence. Be critical but constructive.'
          : 'Evaluate grammar coherence and natural structure. Be encouraging but accurate.';

      const prompt = `Situation: ${systemInfo || 'international travel scenario'}.
AI said: "${currentPrompt || ''}".
User (level ${levelKey}) replied: "${textInput || ''}".
${levelGuide}
${strictness}
Continue with ONE natural follow-up line. Analyse the interpreted phonetics, grammatical coherence and structure.
XP scoring: 75 if fluent and structurally correct, 50 if understandable with minor errors, 25 if very short, unclear or off-topic.
Also provide 3 short alternative phrases the user COULD have said more effectively (in English, appropriate for level ${levelKey}).
Reply ONLY with this raw JSON object:
{"reply": "your follow-up in English", "translation": "traducción al español de reply", "correction": "feedback crítico y breve en español sobre gramática o pronunciación interpretada", "xp": 50, "suggestions": ["phrase 1", "phrase 2", "phrase 3"]}`;

      const text = await llamarGemini(apiKey, SYSTEM_IDENTITY, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    return res.status(200).json({ status: 'Servidor Sinergia activo y escuchando' });

  } catch (error) {
    console.error('Sinergia error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
