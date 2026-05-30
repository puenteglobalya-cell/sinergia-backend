// Sin dependencias externas — usa fetch nativo de Node 18+
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'google/gemma-4-31b-it:free';

const TRAVEL_CONTEXTS = [
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
  'museum ticket counter',
  'currency exchange counter',
  'asking a local for directions on the street',
  'hotel concierge asking for restaurant tips',
  'supermarket checkout with a friendly cashier'
];

const LEVEL_GUIDE = {
  'Starter':           'Use ONLY single words or max 2-word phrases. Very slow. Ultra friendly.',
  'Elementary':        'Short simple sentences (max 6 words). Speak slowly. Very common vocabulary.',
  'Pre-Intermediate':  'Moderate pace. Common travel phrases. Patient and encouraging.',
  'Intermediate':      'Normal conversational pace. Standard vocabulary.',
  'Upper-Intermediate':'Natural pace with occasional idioms.',
  'Advanced':          'Native speed. Rich vocabulary and idioms. No simplification.'
};

function extraerJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in Gemini response: ' + text.slice(0, 100));
  return JSON.parse(match[0]);
}

async function llamarGemini(apiKey, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fliaezquieta.github.io',
        'X-Title': 'Sinergia Familiar'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (data.error) {
      if (data.error.code === 429 && i < retries - 1) {
        await new Promise(r => setTimeout(r, (i + 1) * 2000));
        continue;
      }
      throw new Error(JSON.stringify(data.error));
    }
    const choice = data.choices && data.choices[0];
    if (!choice || !choice.message) throw new Error('No response from OpenRouter: ' + JSON.stringify(data));
    return choice.message.content.trim();
  }
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY in Vercel environment.' });

  try {
    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};
    const levelKey   = level || 'Pre-Intermediate';
    const levelGuide = LEVEL_GUIDE[levelKey] || LEVEL_GUIDE['Pre-Intermediate'];

    if (action === 'generate_scenario') {
      const context = TRAVEL_CONTEXTS[Math.floor(Math.random() * TRAVEL_CONTEXTS.length)];
      const prompt = `You are roleplaying as a staff member or local in this setting: ${context}.
The traveler's English level is ${levelKey}. Language guide: ${levelGuide}
Open the scene with one natural line.
Reply ONLY with this JSON, no extra text:
{"setup_title": "short title in Spanish", "ai_opening": "your opening line in English"}`;

      const text = await llamarGemini(apiKey, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    if (action === 'evaluate_voice') {
      const prompt = `Travel situation: ${systemInfo || 'international travel scenario'}.
You said: "${currentPrompt || ''}".
The traveler (level ${levelKey}) replied: "${textInput || ''}".
Language guide: ${levelGuide}
Continue with ONE natural follow-up line. Be encouraging in the feedback.
XP: 75 if fluent and correct, 50 if understandable with small errors, 25 if very short or unclear.
Reply ONLY with this JSON, no extra text:
{"reply": "your follow-up in English", "correction": "brief tip or compliment in Spanish", "xp": 50}`;

      const text = await llamarGemini(apiKey, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    return res.status(200).json({ status: 'Servidor Sinergia activo y escuchando' });

  } catch (error) {
    console.error('Sinergia error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
