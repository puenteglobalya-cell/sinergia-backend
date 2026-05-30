// Sin dependencias externas — usa fetch nativo de Node 18+
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

async function llamarGemini(apiKey, prompt) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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

    if (action === 'generate_scenario') {
      const context = TRAVEL_CONTEXTS[Math.floor(Math.random() * TRAVEL_CONTEXTS.length)];
      const prompt = `You are roleplaying as a staff member or local in this setting: ${context}.
The traveler's English level is ${levelKey}. Language guide: ${levelGuide}
Open the scene with one natural line.
Reply ONLY with this JSON, no extra text:
{"setup_title": "short title in Spanish", "ai_opening": "your opening line in English", "ai_opening_translation": "traducción al español de ai_opening"}`;

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
{"reply": "your follow-up in English", "translation": "traducción al español de reply", "correction": "brief tip or compliment in Spanish", "xp": 50}`;

      const text = await llamarGemini(apiKey, prompt);
      return res.status(200).json(extraerJSON(text));
    }

    return res.status(200).json({ status: 'Servidor Sinergia activo y escuchando' });

  } catch (error) {
    console.error('Sinergia error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
