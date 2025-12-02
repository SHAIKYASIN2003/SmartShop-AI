import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Product, PrizeTranslation } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    price: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    description: { type: Type.STRING },
    rating: { type: Type.NUMBER },
    category: { type: Type.STRING },
    imageKeyword: { type: Type.STRING, description: "A highly descriptive visual prompt for an AI image generator to create a product image (e.g. 'minimalist white running shoes side view studio lighting')" },
    productUrl: { type: Type.STRING, description: "A realistic-looking url for the product source" },
  },
  required: ["id", "name", "price", "description", "imageKeyword", "productUrl"],
};

export const searchProductsWithGemini = async (query: string): Promise<Product[]> => {
  try {
    const modelId = "gemini-2.5-flash"; // Optimized for speed/cost for search tasks
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a list of 6-8 realistic e-commerce products based on the search query: "${query}". 
      Ensure varied prices and realistic descriptions. 
      The currency should be USD. 
      The imageKeyword should be optimized for an AI image generator (Pollinations.ai) to produce a clean, professional product photo.
      The productUrl should be a simulated external link (e.g. from amazon, nike, etc).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: productSchema,
        },
        systemInstruction: "You are a high-end e-commerce product search engine backend. You generate realistic product data.",
      },
    });

    const text = response.text;
    if (!text) return [];

    const products = JSON.parse(text) as Product[];
    
    // Enrich with a unique ID if generated ones are simple numbers
    return products.map(p => ({
      ...p,
      id: p.id || Math.random().toString(36).substr(2, 9),
      currency: p.currency || 'USD'
    }));

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const generateAddressFromCoordinates = async (lat: number, lng: number): Promise<Partial<any>> => {
    // Note: In a real production app, we would use the googleMaps tool or a dedicated Geocoding API.
    // For this demo, we will simulate "AI Smart Filling" based on lat/lng using general knowledge or
    // simply mock it because the Maps tool requires specific enabling in the Google Cloud Project 
    // which might not be active on the user's key.
    
    // However, if we assume the key has access, we can try to ask Gemini to describe the location
    // or just return a mock "detected" address to show the UI flow.
    
    // Simplification for reliability in this demo: 
    // We return a mock structure that simulates a successful "Locate Me" event.
    return {
        city: "San Francisco",
        state: "CA",
        country: "USA",
        zipCode: "94105"
    };
}

export const enhanceUserProfileImage = async (base64Image: string): Promise<string | null> => {
  try {
    // Remove the data URL prefix to get just the base64 string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg', // Assuming jpeg from the canvas export
            },
          },
          {
            text: 'Enhance this profile picture. Improve image quality, adjust brightness and contrast for a professional look. Ensure it is a clear headshot. Apply a subtle, professional blurred background if the current one is messy. Return only the image.',
          },
        ],
      },
    });

    // Extract the image from the response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Enhance Error:", error);
    return null;
  }
};

export const getPrizeTranslations = async (amount: number): Promise<PrizeTranslation[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the prize amount ₹${amount} into the following languages: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi.
      
      For each language, return the formatted string exactly following this pattern: "₹${amount} – [Amount in Words]".
      
      Examples of desired output format (if amount was 1000):
      English: ₹1000 – One Thousand Rupees
      Hindi: ₹1000 – एक हजार रुपये
      Telugu: ₹1000 – వెయ్యి రూపాయలు
      Tamil: ₹1000 – ஆயிரம் ரூபாய்
      Kannada: ₹1000 – ಸಾವಿರ ರೂಪಾಯಿ
      Malayalam: ₹1000 – ആയിരം രൂപ
      Marathi: ₹1000 – एक हजार रुपये

      Format Requirements:
      - The output must be a JSON array.
      - Each item must be an object with keys: 'language' and 'message'.
      - The 'message' value must be the full string (e.g. "₹${amount} – One Thousand Rupees").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              message: { type: Type.STRING }
            },
            required: ["language", "message"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as PrizeTranslation[];
  } catch (error) {
    console.error("Gemini Prize Translation Error:", error);
    return [];
  }
};