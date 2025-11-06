import { MockProvider } from '../src/providers/mock.js';

function collectStream(provider, payload) {
	let acc = '';
	return provider.streamChat({ ...payload, onDelta: async (d) => (acc += d) }).then(() => acc);
}

describe('Provider contract', () => {
	it('accepts {messages, model, temperature} and yields text deltas', async () => {
		const p = new MockProvider();
		const messages = [
			{ role: 'system', content: 'You are a test.' },
			{ role: 'user', content: 'ping' },
		];
		const out = await collectStream(p, { messages, model: 'mock', temperature: 0 });
		expect(typeof out).toBe('string');
		expect(out.length).toBeGreaterThan(0);
	});
});
