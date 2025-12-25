
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { MODELS } from "../constants";

export const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateText = async (prompt: string, modelName: string = MODELS.TEXT_FLASH) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });
  return response.text;
};

export const generateJson = async (prompt: string, schema: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TEXT_FLASH,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, isPro: boolean = false, aspectRatio: string = "1:1") => {
  const ai = getAI();
  const model = isPro ? MODELS.IMAGE_PRO : MODELS.IMAGE_FLASH;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: isPro ? "1K" : undefined
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data generated");
};

export const generateTTS = async (text: string, voice: string = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.AUDIO_TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });
  
  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64;
};

// Veo polling helper
export const pollVideoOperation = async (operationId: any) => {
    const ai = getAI();
    let operation = operationId;
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return operation.response?.generatedVideos?.[0]?.video?.uri;
};
