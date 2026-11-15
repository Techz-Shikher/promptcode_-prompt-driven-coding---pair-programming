import { GoogleGenAI } from '@google/genai';

export type AIModel = { id: string; name: string; provider: 'google' | 'openai' | 'anthropic' | 'deepseek'; envKey: string };
export type AIResponse = { text: string; modelVersion?: string; usageMetadata?: Record<string, unknown>; latencyMs: number };

const models: AIModel[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'google', envKey: 'GEMINI_API_KEY' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', envKey: 'GEMINI_API_KEY' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', envKey: 'OPENAI_API_KEY' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'anthropic', envKey: 'ANTHROPIC_API_KEY' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'deepseek', envKey: 'DEEPSEEK_API_KEY' },
];

export function getModelCatalog() {
  return models.map(({ id, name, provider, envKey }) => ({ id, name, provider, available: Boolean(process.env[envKey]?.trim() && !process.env[envKey]?.trim().startsWith('MY_')) }));
}

export function getDefaultModel() {
  const configured = process.env.AI_DEFAULT_MODEL?.trim();
  if (configured && models.some((model) => model.id === configured)) return configured;
  return 'gemini-3.8-flash';
}

export function resolveModel(requested?: unknown) {
  const id = typeof requested === 'string' && requested.length <= 80 ? requested : getDefaultModel();
  const model = models.find((item) => item.id === id);
  if (!model) throw new Error('Unsupported AI model. Choose a model listed by /api/ai/models.');
  const apiKey = process.env[model.envKey]?.trim();
  if (!apiKey || apiKey.startsWith('MY_')) throw new Error(`AI_MODEL_UNAVAILABLE:${id}`);
  return { ...model, apiKey };
}

export async function generateAIContent(requested: unknown, contents: string, config: { systemInstruction?: string; responseMimeType?: string; temperature?: number; maxOutputTokens?: number } = {}): Promise<AIResponse> {
  const model = resolveModel(requested);
  const started = Date.now();
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      if (model.provider === 'google') {
        const ai = new GoogleGenAI({ apiKey: model.apiKey, httpOptions: { headers: { 'User-Agent': 'promptcode' } } });
        const result = await ai.models.generateContent({ model: model.id, contents, config: { ...config, abortSignal: controller.signal } });
        return { text: result.text || '', modelVersion: result.modelVersion, usageMetadata: result.usageMetadata as Record<string, unknown> | undefined, latencyMs: Date.now() - started };
      }
      const response = model.provider === 'anthropic'
        ? await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-api-key': model.apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.id, max_tokens: config.maxOutputTokens || 8192, temperature: config.temperature, system: config.systemInstruction || '', messages: [{ role: 'user', content: contents }] }) })
        : await fetch(model.provider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions', { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', authorization: `Bearer ${model.apiKey}` }, body: JSON.stringify({ model: model.id, max_tokens: config.maxOutputTokens, temperature: config.temperature, messages: [...(config.systemInstruction ? [{ role: 'system', content: config.systemInstruction }] : []), { role: 'user', content: contents }], response_format: config.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined }) });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < 2) { await response.body?.cancel(); await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt)); continue; }
        const providerError = new Error(`Provider HTTP ${response.status}`) as Error & { retryable?: boolean };
        providerError.retryable = retryable;
        throw providerError;
      }
      const payload = await response.json() as any;
      const text = model.provider === 'anthropic'
        ? payload.content?.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('')
        : payload.choices?.[0]?.message?.content;
      if (typeof text !== 'string') throw new Error('Provider returned no text content.');
      const rawUsage = payload.usage || {};
      const usageMetadata = model.provider === 'anthropic'
        ? { promptTokenCount: rawUsage.input_tokens, candidatesTokenCount: rawUsage.output_tokens, totalTokenCount: Number(rawUsage.input_tokens || 0) + Number(rawUsage.output_tokens || 0) }
        : { promptTokenCount: rawUsage.prompt_tokens, candidatesTokenCount: rawUsage.completion_tokens, totalTokenCount: rawUsage.total_tokens };
      return { text, modelVersion: payload.model, usageMetadata, latencyMs: Date.now() - started };
    } catch (error) {
      lastError = error;
      if (controller.signal.aborted || (error as { retryable?: boolean })?.retryable === false || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    } finally { clearTimeout(timeout); }
  }
  throw lastError instanceof Error ? lastError : new Error('AI provider request failed.');
}
