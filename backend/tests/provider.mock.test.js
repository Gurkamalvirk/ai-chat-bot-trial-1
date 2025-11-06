import { MockProvider } from '../src/providers/mock.js';

describe('MockProvider', () => {
	test('streams uppercase echo', async () => {
		const p = new MockProvider();
		let acc = '';
		await p.streamChat({ messages: [{ role: 'user', content: 'hi' }], onDelta: async (d) => (acc += d) });
		expect(acc).toBe('[mock] HI');
	});
});
