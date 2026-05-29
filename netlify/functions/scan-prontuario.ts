import { Handler } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'A chave da API do Gemini não está configurada.' }),
    };
  }

  try {
    const { parts } = JSON.parse(event.body || '{}');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sus_card: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            surgery_type: { type: Type.STRING },
            age: { type: Type.INTEGER },
            birth_date: { type: Type.STRING },
            phone: { type: Type.STRING },
            doctor: { type: Type.STRING },
            risk_status: { type: Type.STRING },
            whatsapp_sent: { type: Type.INTEGER },
            aih_generated: { type: Type.INTEGER },
            aih_nir: { type: Type.INTEGER },
            uti_vacancy: { type: Type.INTEGER },
            scheduled_cc: { type: Type.INTEGER },
            exam_pathology: { type: Type.STRING },
            exam_imaging: { type: Type.STRING },
            exam_others: { type: Type.STRING },
          },
        },
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error: any) {
    console.error('Erro ao escanear prontuário:', error);
    if (error.message?.includes('API key not valid')) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'A chave da API do Gemini é inválida.' }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar as imagens.' }),
    };
  }
};
