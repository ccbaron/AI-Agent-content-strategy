import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

export const gemini = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});