const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    // responseMimeType fuerza a Gemini a devolver JSON puro sin markdown
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};

    if (action === 'generate_scenario') {
      const prompt = `Sos un personaje interactivo para un juego de rol educativo en inglés.
Generá una situación o escenario adaptado para un nivel de inglés: ${level || 'Initial'}.
Respondé ÚNICAMENTE con un objeto JSON con exactamente estas dos propiedades:
{
  "setup_title": "Título corto del escenario en castellano",
  "ai_opening": "La frase de apertura que dice tu personaje en inglés para iniciar el juego"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return res.status(200).json(JSON.parse(text));
    }

    if (action === 'evaluate_voice') {
      const prompt = `Contexto del rol: ${systemInfo || 'juego de rol en inglés'}.
Frase del personaje AI: "${currentPrompt || ''}".
El usuario respondió: "${textInput || ''}".
Analizá gramática y coherencia para nivel ${level || 'Initial'}.
Respondé ÚNICAMENTE con un objeto JSON con exactamente estas tres propiedades:
{
  "reply": "Tu respuesta en inglés continuando la conversación de rol de forma amigable",
  "correction": "Un consejo muy breve en castellano sobre su frase, o felicitación si estuvo perfecto",
  "xp": 50
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return res.status(200).json(JSON.parse(text));
    }

    return res.status(200).json({ status: 'Servidor Sinergia activo y escuchando' });

  } catch (error) {
    console.error('Sinergia backend error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
