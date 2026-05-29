const { GoogleGenAI } = require('@google/generative-ai');

module.exports = async function (req, res) {
  // Habilitar CORS para comunicación directa con tu GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta configurar la variable GEMINI_API_KEY en Vercel." });
  }

  try {
    // Inicialización nativa del SDK de Google AI Studio
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};

    // --- ACCIÓN: GENERAR ESCENARIO SORPRESA ---
    if (action === "generate_scenario") {
      const promptSistema = `Sos un personaje interactivo para un juego de rol educativo en inglés. 
      Generá una situación o escenario adaptado para un nivel de inglés: [${level || 'Initial'}].
      Devolvé ÚNICAMENTE un objeto JSON con dos propiedades, sin formatos Markdown ni bloques de código de texto:
      {
        "setup_title": "Título corto del escenario en castellano",
        "ai_opening": "La frase de apertura que dice tu personaje en inglés para iniciar el juego"
      }`;

      const result = await model.generateContent(promptSistema);
      const text = result.response.text().trim();
      
      const jsonLimpio = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return res.status(200).json(JSON.parse(jsonLimpio));
    }

    // --- ACCIÓN: EVALUAR VOZ ---
    if (action === "evaluate_voice") {
      const promptEvaluacion = `Contexto del rol: ${systemInfo || ''}. Frase del personaje AI: "${currentPrompt || ''}".
      El usuario respondió esto de forma hablada: "${textInput || ''}".
      Analizá la gramática y coherencia para un nivel [${level || 'Initial'}].
      Devolvé ÚNICAMENTE un objeto JSON con tres propiedades, sin formatos de código adicionales:
      {
        "reply": "Tu respuesta en inglés continuando la conversación de rol de forma amigable",
        "correction": "Un consejo muy breve en castellano sobre su frase, o felicitación si estuvo perfecto",
        "xp": 50
      }`;

      const result = await model.generateContent(promptEvaluacion);
      const text = result.response.text().trim();
      
      const jsonLimpio = text.replace(/```json/g, "").replace(/
```/g, "").trim();
      return res.status(200).json(JSON.parse(jsonLimpio));
    }

    return res.status(200).json({ status: "Servidor Sinergia activo y escuchando" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
