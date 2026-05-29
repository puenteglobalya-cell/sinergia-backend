import { GoogleGenAI } from '@google/generative-ai';

export default async function handler(request, response) {
    // Configuración segura de cabeceras CORS para permitir la conexión desde tu GitHub Pages
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Responder de inmediato a las peticiones de control de navegador (Preflight)
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Restringir el backend únicamente a peticiones seguras de tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Inicialización del motor de Google utilizando la variable encriptada en el servidor de Vercel
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { action, textInput, level, systemInfo, currentPrompt } = request.body;

        // ACCIÓN A: Orquestación y simulación del Gemini Surprise Topic
        if (action === 'generate_scenario') {
            const matrixTemasOcultos = [
                "Expat compound community administration interaction, requesting structural villa revisions.",
                "Premium metro transit network, requesting high-tier luxury family gold carriage card routing.",
                "International schooling coordinator presentation, analyzing core curriculum structures.",
                "Liquefied distributions high-level meeting, discussing pipeline management operations and strict risk-mitigation pricing baselines."
            ];
            const temaSecreto = matrixTemasOcultos[Math.floor(Math.random() * matrixTemasOcultos.length)];

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: `Context framework: ${temaSecreto}. User current experience profile: ${level}. Design an advanced starting dialogue line or question for an interactive English simulation. Return strictly a raw valid JSON object with keys: "setup_title" and "ai_opening". Do not include markdown formatting, markdown code blocks, or backticks. Strict corporate setting orientation.`,
                config: { responseMimeType: "application/json" }
            });

            return response.status(200).json(JSON.parse(geminiResponse.text));
        }

        // ACCIÓN B: Procesamiento gramatical y feedback de voz real interactiva
        if (action === 'evaluate_voice') {
            // Aplicar un sesgo estrictamente crítico y analítico para niveles avanzados
            let strictness = level === 'Advanced' 
                ? 'Apply a strictly critical, rigorous, and conservative grading bias. Keep target scores low, between 15-30 XP max, focusing heavily on syntax accuracy.' 
                : 'Be encouraging and supportive, grading performance between 35-50 XP.';

            const promptFinal = `Character dialogue context line was: "${currentPrompt}". User physically replied via native voice input: "${textInput}". Perform a comprehensive grammar and structural fluency evaluation. Environment framework: ${systemInfo}. ${strictness}. Return strictly a raw valid JSON object string with keys: "reply" (your next conversational narrative sentence staying strictly in character), "correction" (constructive, highly specific language tip in English), and "xp" (the exact score integer gained). Do not include markdown formatting, backticks, or code blocks.`;

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: promptFinal,
                config: { responseMimeType: "application/json" }
            });

            return response.status(200).json(JSON.parse(geminiResponse.text));
        }

    } catch (error) {
        console.error("Vercel Server Error:", error);
        return response.status(500).json({ error: "Internal server processing failed" });
    }
}
