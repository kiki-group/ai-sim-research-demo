import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL, useStore } from "../store/useStore";

export class GeminiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "GeminiError";
  }
}

function getClient(): { client: GoogleGenAI; model: string } {
  const { apiKey } = useStore.getState();
  if (!apiKey) throw new GeminiError("Missing Gemini API key.");
  return {
    client: new GoogleGenAI({ apiKey }),
    model: GEMINI_MODEL,
  };
}

/** Validate the key by doing a minimal generation (one token). */
export async function validateApiKey(
  apiKey: string,
  model = GEMINI_MODEL
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = new GoogleGenAI({ apiKey });
    const res = await client.models.generateContent({
      model,
      contents: "Reply with the word OK.",
      config: {
        temperature: 0,
        maxOutputTokens: 8,
      },
    });
    const text = res.text ?? "";
    if (!text) return { ok: false, error: "Empty response from Gemini." };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Validation failed." };
  }
}

export async function generateText(
  prompt: string,
  opts: { system?: string; temperature?: number } = {}
): Promise<string> {
  const { client, model } = getClient();
  const res = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: opts.system,
      temperature: opts.temperature ?? 0.8,
    },
  });
  return res.text ?? "";
}

export async function generateStructured<T>(
  prompt: string,
  schema: any,
  opts: { system?: string; temperature?: number } = {}
): Promise<T> {
  const { client, model } = getClient();
  const res = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: opts.system,
      temperature: opts.temperature ?? 0.8,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  const text = (res.text ?? "").trim();
  if (!text) throw new GeminiError("Empty response from Gemini.");
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch (e2) {
      throw new GeminiError("Model did not return valid JSON.", e2);
    }
  }
}
