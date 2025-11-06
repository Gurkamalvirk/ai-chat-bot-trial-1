export class MockProvider {
	id() {
		return 'mock';
	}

	supportsStreaming() {
		return true;
	}

	async streamChat({ messages, onDelta }) {
		const last = messages[messages.length - 1]?.content || '';
		const reply = `[mock] ${last.toUpperCase()}`;
		for (const ch of reply.split('')) {
			// eslint-disable-next-line no-await-in-loop
			await onDelta(ch);
		}
		return { finishReason: 'stop' };
	}
}
