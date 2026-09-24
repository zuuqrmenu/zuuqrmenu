import dotenv from 'dotenv';

const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const sanitizeError = (error, apiKey) => {
  let message = error?.message || 'NVIDIA API call failed';
  if (apiKey && typeof message === 'string') {
    message = message.split(apiKey).join('[REDACTED]');
  }
  return message;
};

export const generateText = async ({ prompt, systemInstruction, restaurantContext, model, images = [], providerTimeoutMs }) => {
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

  let userContent = images.length > 0
    ? [{ type: 'text', text: prompt }, ...images.map((image) => ({
      type: 'image_url',
      image_url: { url: `data:${image.mimeType};base64,${image.data}` },
    }))]
    : prompt;
  if (restaurantContext && typeof restaurantContext === 'string' && restaurantContext.trim()) {
    const contextText = `[RESTORAN VE MENÜ BİLGİLERİ]:\n${restaurantContext.trim()}\n\n[KULLANICI MESAJI]:\n${prompt}`;
    userContent = images.length > 0
      ? [{ type: 'text', text: contextText }, ...images.map((image) => ({
        type: 'image_url',
        image_url: { url: `data:${image.mimeType};base64,${image.data}` },
      }))]
      : contextText;
  }
  messages.push({ role: 'user', content: userContent });

  try {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), providerTimeoutMs || (images.length > 0 ? 180000 : 90000));
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it',
        max_tokens: 1024,
        stream: true,
        temperature: 0.5,
        top_p: 1,
        messages,
      }),
      signal: abortController.signal,
    });
    if (!response.ok) {
      clearTimeout(timeout);
      const responseData = await response.json().catch(() => ({}));
      const providerMessage = responseData?.error?.message || responseData?.detail || `HTTP ${response.status}`;
      const error = new Error(providerMessage);
      error.statusCode = response.status >= 400 && response.status < 500 ? response.status : 502;
      throw error;
    }

    if (!response.body) {
      clearTimeout(timeout);
      throw new Error('NVIDIA boş bir streaming yanıtı döndürdü.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let reply = '';
    let reasoning = '';
    let usage = null;

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const chunk = JSON.parse(payload);
          const delta = chunk?.choices?.[0]?.delta;
          reply += delta?.content || '';
          reasoning += delta?.reasoning_content || '';
          if (chunk?.usage) {
            usage = {
              promptTokens: Number(chunk.usage.prompt_tokens) || 0,
              candidateTokens: Number(chunk.usage.completion_tokens) || 0,
              totalTokens: Number(chunk.usage.total_tokens) || 0,
            };
          }
        } catch (_) {
          // Ignore incomplete SSE fragments; the next chunk completes them.
        }
      }

      if (done) break;
    }
    clearTimeout(timeout);

    const finalReply = (reply || reasoning).trim();
    if (!finalReply) {
      throw new Error('NVIDIA returned an empty response.');
    }

    return { text: finalReply, usage, model: model || 'google/gemma-4-31b-it' };
  } catch (error) {
    const safeError = new Error(sanitizeError(error, apiKey));
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      safeError.message = 'NVIDIA modeli zamanında yanıt vermedi. NVIDIA tarafında model erişilebilirliğini kontrol edin.';
      safeError.statusCode = 504;
    } else {
      safeError.statusCode = error.statusCode || 502;
    }
    throw safeError;
  }
};

export default { generateText };