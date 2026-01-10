
import { GoogleGenAI, Type } from "@google/genai";
import { Product, BusinessData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Feature 1: Auto-fill product details based on a name
export const generateProductDetails = async (productName: string): Promise<Partial<Product> | null> => {
  try {
    const ai = getAIClient();
    // Use gemini-3-flash-preview for basic data generation tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate realistic inventory details for a product named "${productName}". 
      Return a JSON object with: 
      - description (short marketing blurb)
      - category (general retail category)
      - price (estimated retail price in USD)
      - sku (a generated alphanumeric code, e.g., 'ABC-123')
      - taxRate (estimated percentage tax rate like 0, 5, 10, 18 based on general goods category)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            price: { type: Type.NUMBER },
            sku: { type: Type.STRING },
            taxRate: { type: Type.NUMBER }
          },
          required: ["description", "category", "price", "sku", "taxRate"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Product Gen Error:", error);
    return null;
  }
};

// Feature 2: Analyze Business Health
export const analyzeBusinessHealth = async (data: BusinessData): Promise<string> => {
  try {
    const ai = getAIClient();
    // Summarize data to avoid token limits if data is huge
    const summary = {
      totalProducts: data.products.length,
      lowStockItems: data.products.filter(p => p.stockQuantity < p.minStockLevel).map(p => p.name),
      totalRevenue: data.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalTaxCollected: data.invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0),
      recentSales: data.invoices.slice(0, 5).map(i => ({ amount: i.totalAmount, date: i.date })),
      topCustomers: data.parties.slice(0, 5).map(p => p.name)
    };

    // Use gemini-3-pro-preview for complex reasoning and analysis tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a senior business analyst for a small business. Analyze this inventory, party and sales summary:
      ${JSON.stringify(summary, null, 2)}
      
      Provide 3 concise, actionable bullet points for the business owner to improve efficiency, tax handling, or sales. 
      Do not use markdown formatting like bolding, just plain text bullets.`,
    });

    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate insights at this time.";
  }
};
