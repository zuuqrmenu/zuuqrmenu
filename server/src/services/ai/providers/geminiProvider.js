import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

/**
 * Strips sensitive values like the Gemini API key from error messages
 */
const sanitizeError = (error, apiKey) => {
  let message = error?.message || 'Gemini API call failed';
  if (apiKey && typeof message === 'string') {
    message = message.split(apiKey).join('[REDACTED]');
  }
  return message;
};

/**
 * Strips raw markdown formatting characters (headings, bold, backticks)
 * to ensure output renders cleanly as plain text in the chat bubble.
 */
export const cleanPlainText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    // Replace markdown headings: e.g. ## Heading -> Heading
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Remove bold asterisks: **text** -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove bold/italic underscores: __text__ -> text, _text_ -> text
    .replace(/__(.*?)__/g, '$1')
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '$1')
    // Remove inline code backticks: `text` -> text
    .replace(/`([^`]+)`/g, '$1')
    // Remove code block backticks: ```text``` -> text
    .replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1')
    .trim();
};

/**
 * Generates text using Google Gemini
 * @param {Object} options
 * @param {string} options.prompt - User message / prompt
 * @param {string} [options.systemInstruction] - System instructions for the model
 * @param {string} [options.model] - Optional override for Gemini model
 * @returns {Promise<string>} The generated text response
 */
export const generateText = async ({ prompt, systemInstruction, restaurantContext, model }) => {
  // Ensure fresh environment variables are available
  dotenv.config({ override: true });
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const err = new Error('GEMINI_API_KEY is missing or not configured.');
    err.statusCode = 500;
    throw err;
  }

  const modelName = model || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const ai = new GoogleGenAI({ apiKey });

  const config = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  // Construct cleanly separated contents when restaurant context is available
  let contents = prompt;
  if (restaurantContext && typeof restaurantContext === 'string' && restaurantContext.trim()) {
    contents = [
      {
        role: 'user',
        parts: [
          { text: `[RESTORAN VE MENÜ BİLGİLERİ]:\n${restaurantContext.trim()}` },
          { text: `[KULLANICI MESAJI]:\n${prompt}` },
        ],
      },
    ];
  }

  let attempts = 0;
  let lastError = null;

  while (attempts < 3) {
    attempts++;
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const reply = response?.text?.trim();
      if (!reply) {
        throw new Error('Gemini returned an empty response.');
      }

      const usageMetadata = response?.usageMetadata;
      const usage = usageMetadata ? {
        promptTokens: Number(usageMetadata.promptTokenCount) || 0,
        candidateTokens: Number(usageMetadata.candidatesTokenCount) || 0,
        totalTokens: Number(usageMetadata.totalTokenCount) || 0,
      } : null;

      return {
        text: cleanPlainText(reply),
        usage,
        model: modelName,
      };
    } catch (error) {
      lastError = error;
      const isTransientSpike = error?.status === 503 ||
        error?.message?.includes('503') ||
        error?.message?.includes('high demand') ||
        error?.message?.includes('UNAVAILABLE');

      if (attempts < 3 && isTransientSpike) {
        // Exponential backoff: wait 1s on 1st retry, 2s on 2nd retry
        await new Promise((resolve) => setTimeout(resolve, attempts * 1000));
        continue;
      }

      break;
    }
  }

  const sanitizedMessage = sanitizeError(lastError, apiKey);
  const safeError = new Error(sanitizedMessage);
  safeError.statusCode = lastError?.status || 502;
  throw safeError;
};

export default {
  generateText,
};
