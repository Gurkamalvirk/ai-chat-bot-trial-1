import request from 'supertest';
import app from '../src/server.js';
import mongoose from 'mongoose';
import { connectDb } from '../src/utils/db.js';

// These tests expect a local MongoDB in MONGODB_URI (default localhost)

describe('Chat SSE (mock provider)', () => {
	beforeAll(async () => {
		await connectDb();
	});
	afterAll(async () => {
		await mongoose.connection.close();
	});

	test('register, create session, and receive SSE stream', async () => {
		const agent = request.agent(app);
		const email = `test_${Date.now()}@example.com`;
		await agent.post('/api/auth/register').send({ email, password: 'password123' }).expect(200);
		const sessionRes = await agent.post('/api/sessions').send({ title: 'Test', provider: 'mock', model: 'mock' }).expect(200);
		const sessionId = sessionRes.body.session._id;

		const res = await agent
			.post('/api/chat/send')
			.set('Accept', 'text/event-stream')
			.send({ sessionId, message: 'hello', provider: 'mock', model: 'mock' })
			.expect(200);

		// Ensure content type is SSE
		expect(res.headers['content-type']).toMatch(/text\/event-stream/);
		// Response body should include at least one data: line and a done
		expect(res.text).toMatch(/data: /);
		expect(res.text).toMatch(/\"type\":\"done\"/);
	});
});
