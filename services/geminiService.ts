
import { GoogleGenAI, Type } from "@google/genai";
import { AIRugResponse } from "../types";

export const generateRugTheme = async (style: string): Promise<AIRugResponse> => {
  // Always use a named parameter and process.env.API_KEY directly when initializing the GoogleGenAI client instance.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a highly detailed ASCII Persian Rug design specification for the style: "${style}". 
  The rug should have a sophisticated multi-layered border system (at least 3 distinct borders) and a dense, symmetrical field.
  
  Provide a name, a poetic description, and a set of distinct characters for:
  1. Outer geometric border (slim)
  2. Wide secondary border (decorative)
  3. Main field pattern (complex)
  4. Central medallion or focal motif
  5. Accent details used throughout.
  
  Characters should be visually distinct (e.g., █ for solid, ╬ for ornate lines, ❀ for floral).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            characters: {
              type: Type.OBJECT,
              properties: {
                border: { type: Type.STRING },
                innerBorder: { type: Type.STRING },
                field: { type: Type.STRING },
                medallion: { type: Type.STRING },
                accent: { type: Type.STRING },
              },
              required: ["border", "innerBorder", "field", "medallion", "accent"]
            }
          },
          required: ["name", "description", "characters"]
        }
      }
    });

    // Extract the text output using the .text property (not a method).
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text.trim()) as AIRugResponse;
  } catch (error) {
    console.error("Error generating rug theme:", error);
    return {
      name: "The Grand Shiraz",
      description: "A masterwork of nested patterns and mythic motifs, woven in code.",
      characters: {
        border: "█",
        innerBorder: "╬",
        field: "·",
        medallion: "❂",
        accent: "✧"
      }
    };
  }
};
