const { GoogleGenerativeAI } = require('@google/generative-ai');

// Extrae el primer objeto JSON válido de cualquier texto que devuelva Gemini
function extraerJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No se encontró JSON en la respuesta de Gemini: ' + text);
  return JSON.parse(match[0]);
}

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
      const prompt = `Sos un personaje interactivo para un juego de rol educativo en inglés.
Generá una situación para nivel de inglés: ${level || 'Initial'}.
Respondé SOLO con este JSON, sin texto extra ni bloques de código:
{"setup_title": "título en castellano", "ai_opening": "frase de apertura en inglés"}`;

      const result = await model.generateContent(prompt);
      const data = extraerJSON(result.response.text());
      return res.status(200).json(data);
    }

    if (action === 'evaluate_voice') {
      const prompt = `Contexto: ${systemInfo || 'juego de rol en inglés'}.
El personaje dijo: "${currentPrompt || ''}".
El usuario respondió: "${textInput || ''}".
Nivel: ${level || 'Initial'}.
Respondé SOLO con este JSON, sin texto extra ni bloques de código:
{"reply": "tu respuesta en inglés", "correction": "consejo breve en castellano", "xp": 50}`;

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
