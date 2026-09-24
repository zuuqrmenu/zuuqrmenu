import dotenv from 'dotenv';

const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const sanitizeError = (error, apiKey) => {
  let message = error?.message || 'NVIDIA API call failed';
  if (apiKey && typeof message === 'string') {
    message = message.split(apiKey).join('[REDACTED]');
  }
  return message;
};

export const generateText = async ({ prompt, systemInstruction, restaurantContext, model }) => {
  dotenv.config({ override: true });
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const error = new Error('NVIDIA_API_KEY is missing or not configured.');
    error.statusCode = 500;
    throw error;
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  let userContent = prompt;
  if (restaurantContext && typeof restaurantContext === 'string' && restaurantContext.trim()) {
    userContent = `[RESTORAN VE MENÜ BİLGİLERİ]:\n${restaurantContext.trim()}\n\n[KULLANICI MESAJI]:\n${prompt}`;
  }
  messages.push({ role: 'user', content: userContent });

  try {
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it',
        max_tokens: 1024,
        stream: false,
        temperature: 0.5,
        top_p: 1,
        messages,
      }),
    });

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage = responseData?.error?.message || responseData?.detail || `HTTP ${response.status}`;
      const error = new Error(providerMessage);
      error.statusCode = response.status >= 400 && response.status < 500 ? response.status : 502;
      throw error;
    }

    const reply = responseData?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error('NVIDIA returned an empty response.');
    }

    const usage = responseData?.usage ? {
      promptTokens: Number(responseData.usage.prompt_tokens) || 0,
      candidateTokens: Number(responseData.usage.completion_tokens) || 0,
      totalTokens: Number(responseData.usage.total_tokens) || 0,
    } : null;

    return { text: reply, usage, model: model || 'google/gemma-4-31b-it' };
  } catch (error) {
    const safeError = new Error(sanitizeError(error, apiKey));
    safeError.statusCode = error.statusCode || 502;
    throw safeError;
  }
};

export default { generateText };