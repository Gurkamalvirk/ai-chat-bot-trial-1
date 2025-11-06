export class DialogflowProvider {
	constructor() {
		this.ready = Boolean(process.env.DIALOGFLOW_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS);
	}

	id() {
		return 'dialogflow';
	}

	supportsStreaming() {
		return true;
	}

	async streamChat({ messages, onDelta }) {
		if (!this.ready) throw new Error('Dialogflow not configured');
		const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
		const text = `Dialogflow echo: ${lastUser}`;
		for (const ch of text.split('')) {
			// eslint-disable-next-line no-await-in-loop
			await onDelta(ch);
		}
		return { finishReason: 'stop' };
	}
}
