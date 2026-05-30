const { GoogleGenerativeAI } = require('@google/generative-ai');

// Extrae el primer objeto JSON válido de cualquier texto que devuelva Gemini
function extraerJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No se encontró JSON en la respuesta de Gemini: ' + text);
  return JSON.parse(match[0]);
}

// Contextos internacionales de viaje para generar escenarios variados
const TRAVEL_CONTEXTS = [
  "airport check-in counter",
  "hotel reception desk",
  "taxi or rideshare to the city",
  "international restaurant ordering food",
  "shopping mall asking for help finding a product",
  "pharmacy asking for medicine",
  "customs and immigration officer",
  "tourist information desk",
  "lost luggage desk at the airport",
  "rooftop bar ordering drinks",
  "museum ticket counter",
  "currency exchange counter",
  "asking for directions in the street",
  "convenience store late at night",
  "hotel concierge asking for recommendations"
];

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

    if (action === 'generate_scenario') {
      // Elegir un contexto aleatorio de la lista
      const context = TRAVEL_CONTEXTS[Math.floor(Math.random() * TRAVEL_CONTEXTS.length)];

      const prompt = `You are roleplaying as a staff member or local person in an international travel situation.
The setting is: ${context}.
The English level of the traveler is: ${level || 'Initial'}.

Create a natural, realistic opening moment for this situation.
For Initial level: use simple, slow, friendly English.
For Intermediate: normal conversational English.
For Upper-Intermediate: natural fast-paced English with some idioms.

Respond ONLY with this exact JSON, no extra text or code blocks:
{"setup_title": "short title in Spanish describing the situation", "ai_opening": "your opening line in English as the staff/local person"}`;

      const result = await model.generateContent(prompt);
      const data = extraerJSON(result.response.text());
      return res.status(200).json(data);
    }

    if (action === 'evaluate_voice') {
      const prompt = `You are roleplaying in this international travel situation: ${systemInfo || 'travel scenario'}.
You just said: "${currentPrompt || ''}".
The traveler (English level: ${level || 'Initial'}) responded: "${textInput || ''}".

Continue the conversation naturally as the staff/local person would.
Evaluate their response considering their level — be encouraging and helpful.

Respond ONLY with this exact JSON, no extra text or code blocks:
{"reply": "your natural follow-up line in English continuing the scene", "correction": "one short tip in Spanish about their phrase, or a brief compliment if it was good", "xp": 50}`;

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
