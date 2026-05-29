import { GoogleGenAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Manejo del puente de comunicación (CORS) para que GitHub Pages pueda entrar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si es una petición de control (OPTIONS), respondemos rápido y salimos
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Verificar que la clave secreta que guardamos en Vercel esté disponible
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta configurar la variable GEMINI_API_KEY en Vercel." });
  }

  try {
    // 3. Inicializar el motor de Google
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extraer los datos que envía la página web
    const { action, level, textInput, currentPrompt, systemInfo } = req.body || {};

    // --- ACCIÓN A: GENERAR ESCENARIO SORPRESA ---
    if (action === "generate_scenario") {
      const promptSistema = `Sos un personaje interactivo para un juego de rol educativo en inglés. 
      Generá una situación o escenario adaptado para un nivel de inglés: [${level || 'Initial'}].
      Devolvé ÚNICAMENTE un objeto JSON con dos propiedades, sin formatos Markdown ni textos extras:
      {
        "setup_title": "Título corto del escenario en castellano (ej: Café en París)",
        "ai_opening": "La frase de apertura que dice tu personaje en inglés para iniciar el juego"
      }`;

      const result = await model.generateContent(promptSistema);
      const text = result.response.text().trim();
      
      // Limpiar posibles bloques de código markdown que meta Gemini por error
      const jsonLimpio = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return res.status(200).json(JSON.parse(jsonLimpio));
    }

    // --- ACCIÓN B: EVALUAR LA VOZ DEL USUARIO ---
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

    // Si mandan una acción desconocida
    return res.status(400).json({ error: "Acción no válida" });

  } catch (error) {
    // Si algo falla dentro de Gemini, devolvemos el error amigable para no congelar el servidor
    return res.status(500).json({ error: error.message });
  }
}
