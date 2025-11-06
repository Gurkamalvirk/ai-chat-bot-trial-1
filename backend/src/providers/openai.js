import OpenAI from 'openai';

export class OpenAIProvider {
	constructor() {
		this.client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
	}

	id() {
		return 'openai';
	}

	supportsStreaming() {
		return true;
	}

	async streamChat({ messages, model = 'gpt-3.5-turbo', temperature = 0.7, onDelta }) {
		if (!this.client) throw new Error('OPENAI_API_KEY not configured');
		const response = await this.client.chat.completions.create({
			model,
			messages,
			temperature,
			stream: true,
		});
		for await (const chunk of response) {
			const delta = chunk.choices?.[0]?.delta?.content || '';
			if (delta) await onDelta(delta);
		}
		return { finishReason: 'stop' };
	}
}
