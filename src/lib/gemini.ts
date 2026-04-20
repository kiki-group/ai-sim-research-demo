import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL, useStore } from "../store/useStore";

export class GeminiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "GeminiError";
  }
}

/**
 * Normalize an unknown error coming from the Gemini SDK / fetch into a
 * short human-readable string. Gemini returns structured JSON errors like
 * `{"error":{"code":400,"message":"...","status":"INVALID_ARGUMENT"}}`
 * that we want to surface as "400 INVALID_ARGUMENT: …".
 */
function humanizeError(e: unknown): string {
  if (!e) return "Unknown error.";
  if (typeof e === "string") return parseMaybeJsonError(e);
  const any = e as any;
  const raw = any?.message ?? any?.error?.message ?? String(e);
  return parseMaybeJsonError(raw);
}

function parseMaybeJsonError(raw: string): string {
  const trimmed = String(raw).trim();
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      const err = obj.error ?? obj;
      const parts = [
        err.code && String(err.code),
        err.status,
      ].filter(Boolean);
      const head = parts.join(" ");
      const msg = err.message ?? trimmed;
      return head ? `${head}: ${msg}` : msg;
    } catch {
      /* fall through */
    }
  }
  return trimmed;
}

function getClient(): { client: GoogleGenAI; model: string } {
  const { apiKey } = useStore.getState();
  if (!apiKey) throw new GeminiError("Missing Gemini API key.");
  return {
    client: new GoogleGenAI({ apiKey }),
    model: GEMINI_MODEL,
  };
}

/**
 * Validate the key by doing a minimal generation. Thinking is disabled
 * so the model doesn't burn our tiny maxOutputTokens budget on reasoning
 * (a Gemini 3 pitfall — thinking is default-on for Pro).
 */
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
        maxOutputTokens: 32,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const text = (res.text ?? "").trim();
    if (!text) return { ok: false, error: "Empty response from Gemini." };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: humanizeError(e) };
  }
}

export async function generateText(
  prompt: string,
  opts: { system?: string; temperature?: number } = {}
): Promise<string> {
  const { client, model } = getClient();
  try {
    const res = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.8,
        // Disable thinking: Pro is plenty capable for our tasks
        // without it, and this keeps latency + token budgets tight.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return res.text ?? "";
  } catch (e) {
    throw new GeminiError(humanizeError(e), e);
  }
}

export async function generateStructured<T>(
  prompt: string,
  schema: any,
  opts: { system?: string; temperature?: number } = {}
): Promise<T> {
  const { client, model } = getClient();
  let res;
  try {
    res = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.8,
        responseMimeType: "application/json",
        responseSchema: schema,
        // Disable thinking — Gemini 3 Pro with thinking on can burn
        // the output budget on reasoning and return empty visible text.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
  } catch (e) {
    // Log raw error for debugging while surfacing a friendlier message.
    // eslint-disable-next-line no-console
    console.error("[Gemini] generateStructured failed", e);
    throw new GeminiError(humanizeError(e), e);
  }
  const text = (res.text ?? "").trim();
  if (!text) {
    throw new GeminiError(
      "Empty response from Gemini. The model may have hit a safety filter or rate limit — try again."
    );
  }
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
