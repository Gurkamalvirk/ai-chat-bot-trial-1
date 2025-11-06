import { GoogleGenerativeAI } from '@google/generative-ai';

function normalizeModel(model) {
    const m = (model || '').toLowerCase();
    // Map common aliases to current recommended model IDs
    if (m === 'gemini-2.5-flash') return 'gemini-2.5-flash';
    if (m === 'gemini-1.5-flash-002') return 'gemini-2.5-flash';
    if (m === 'gemini-1.5-pro-002') return 'gemini-1.5-pro';
    if (m === 'gemini-pro') return 'gemini-1.5-pro';
    if (m === 'gemini-flash') return 'gemini-2.5-flash';
    if (m === 'gemini-1.5-flash') return 'gemini-2.5-flash';
    if (m === 'gemini-1.5-pro') return 'gemini-1.5-pro';
    return model || 'gemini-2.5-flash';
}

export class GeminiProvider {
	constructor() {
		this.apiKey = process.env.GEMINI_API_KEY;
		this.client = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
	}

	id() {
		return 'gemini';
	}

	supportsStreaming() {
		return true;
	}

	async streamChat({ messages, model = 'gemini-1.5-flash-002', temperature = 0.7, onDelta }) {
		if (!this.client) throw new Error('GEMINI_API_KEY not configured');
		const sys = messages.find((m) => m.role === 'system')?.content;
		const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
		const prompt = sys ? `${sys}\n\n${lastUser}` : lastUser;
		const modelId = normalizeModel(model);
		const genModel = this.client.getGenerativeModel({ model: modelId, generationConfig: { temperature } });
		const resp = await genModel.generateContentStream({
			contents: [
				{ role: 'user', parts: [{ text: prompt }] },
			],
		});
		for await (const chunk of resp.stream) {
			const text = chunk.text();
			if (text) await onDelta(text);
		}
		return { finishReason: 'stop' };
	}
}
