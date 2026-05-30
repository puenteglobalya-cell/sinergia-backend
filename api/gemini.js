const { GoogleGenerativeAI } = require('@google/generative-ai');

function extraerJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No se encontró JSON en la respuesta de Gemini: ' + text);
  return JSON.parse(match[0]);
}

const TRAVEL_CONTEXTS = [
  "airport check-in counter",
  "hotel reception desk",
  "taxi or rideshare to the city center",
  "international restaurant, waiter taking the order",
  "shopping mall, staff helping find a product",
  "pharmacy asking for medicine or sunscreen",
  "customs and immigration officer at the airport",
  "tourist information desk in the city",
  "lost luggage counter at the airport",
  "rooftop bar or café ordering drinks and snacks",
  "museum or attraction ticket counter",
  "currency exchange counter",
  "asking a local for directions on the street",
  "hotel concierge asking for restaurant recommendations",
  "supermarket checkout with a friendly cashier"
];

// Instrucciones de Gemini adaptadas por nivel
const LEVEL_INSTRUCTIONS = {
  'Starter':           'Use ONLY single words or maximum 2-word phrases. Speak very slowly. Be extremely warm and encouraging. Example phrases: "Hello!", "Come in!", "Your name?"',
  'Elementary':        'Use short simple sentences (max 6 words). Speak slowly and clearly. Vocabulary must be very common. Example: "Can I help you?", "What do you need?"',
  'Pre-Intermediate':  'Speak at a moderate pace. Use common travel phrases. The person has dormant school English — be patient, rephrase if needed, build their confidence.',
  'Intermediate':      'Speak at normal conversational pace. Use standard travel and daily-life vocabulary. Allow natural pauses.',
  'Upper-Intermediate':'Speak at natural pace with occasional idioms. Challenge the person slightly. Example idioms: "No worries", "That works for me", "Just around the corner".',
  'Advanced':          'Speak fully naturally at native pace. Use rich vocabulary, idioms freely, colloquial expressions. No simplification.'
};

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar la variable GEMINI_API_KEY en Vercel.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};
    const levelKey = level || 'Pre-Intermediate';
    const levelGuide = LEVEL_INSTRUCTIONS[levelKey] || LEVEL_INSTRUCTIONS['Pre-Intermediate'];

    if (action === 'generate_scenario') {
      const context = TRAVEL_CONTEXTS[Math.floor(Math.random() * TRAVEL_CONTEXTS.length)];

      const prompt = `You are roleplaying as a staff member or local person in this setting: ${context}.
The traveler's English level is: ${levelKey}. Language guide: ${levelGuide}

Open the scene with a single natural line, as if you are starting the interaction.

Respond ONLY with this exact JSON, no extra text or code blocks:
{"setup_title": "título corto en castellano del escenario", "ai_opening": "your opening line in English"}`;

      const result = await model.generateContent(prompt);
      const data = extraerJSON(result.response.text());
      return res.status(200).json(data);
    }

    if (action === 'evaluate_voice') {
      const prompt = `You are roleplaying in this travel situation: ${systemInfo || 'international travel scenario'}.
You just said to the traveler: "${currentPrompt || ''}".
The traveler (English level: ${levelKey}) responded: "${textInput || ''}".
Language guide for your reply: ${levelGuide}

Continue the scene naturally with ONE follow-up line.
For the correction: be brief and encouraging in Spanish. If the phrase was correct, compliment it. Never make the person feel bad.
The XP value should reflect effort: correct and fluent = 75, understandable with errors = 50, very short or unclear = 25.

Respond ONLY with this exact JSON, no extra text or code blocks:
{"reply": "your one follow-up line in English", "correction": "consejo o felicitación breve en castellano", "xp": 50}`;

      const result = await model.generateContent(prompt);
      const data = extraerJSON(result.response.text());
      return res.status(200).json(data);
    }

    return res.status(200).json({ status: 'Servidor Sinergia activo y escuchando' });

  } catch (error) {
    console.error('Sinergia backend error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
