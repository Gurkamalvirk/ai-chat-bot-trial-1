import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Session } from '../models/Session.js';
import { Message } from '../models/Message.js';
import { getProvider } from '../providers/index.js';

export const sessionsRouter = express.Router();

sessionsRouter.use(requireAuth);

sessionsRouter.get('/', async (req, res) => {
	const sessions = await Session.find({ userId: req.user.sub }).sort({ updatedAt: -1 }).limit(100);
	res.json({ sessions });
});

sessionsRouter.get('/:id/messages', async (req, res) => {
	const { id } = req.params;
	const msgs = await Message.find({ sessionId: id, userId: req.user.sub }).sort({ createdAt: 1 });
	res.json({ messages: msgs.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })) });
});

sessionsRouter.post('/', async (req, res) => {
	const { title = 'New Chat', provider = 'openai', model = 'gpt-3.5-turbo' } = req.body || {};
	const session = await Session.create({ userId: req.user.sub, title, provider, model });
	res.json({ session });
});

sessionsRouter.post('/:id/summarize', async (req, res) => {
	const { id } = req.params;
	const session = await Session.findOne({ _id: id, userId: req.user.sub });
	if (!session) return res.status(404).json({ error: 'session_not_found' });
	const msgs = await Message.find({ sessionId: id, userId: req.user.sub }).sort({ createdAt: 1 });
	if (!msgs.length) return res.json({ ok: true, summary: '' });
	const messages = [
		{ role: 'system', content: 'Summarize the following chat succinctly for future context. Keep under 200 words.' },
		...msgs.map((m) => ({ role: m.role, content: m.content })),
	];
	const p = getProvider(session.provider);
	let accumulated = '';
	try {
		await p.streamChat({ messages, model: session.model, temperature: 0.2, onDelta: async (d) => (accumulated += d) });
		await Message.create({ sessionId: id, userId: req.user.sub, role: 'system', content: `Summary:\n${accumulated}` });
		return res.json({ ok: true, summary: accumulated });
	} catch (e) {
		return res.status(500).json({ error: 'summarize_failed', details: e.message });
	}
});

sessionsRouter.delete('/:id', async (req, res) => {
	const { id } = req.params;
	await Message.deleteMany({ sessionId: id, userId: req.user.sub });
	await Session.deleteOne({ _id: id, userId: req.user.sub });
	res.json({ ok: true });
});

sessionsRouter.post('/:id/clear', async (req, res) => {
	const { id } = req.params;
	await Message.deleteMany({ sessionId: id, userId: req.user.sub });
	res.json({ ok: true });
});

sessionsRouter.get('/:id/export', async (req, res) => {
	const { id } = req.params;
	const msgs = await Message.find({ sessionId: id, userId: req.user.sub }).sort({ createdAt: 1 });
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Disposition', `attachment; filename="session-${id}.json"`);
	res.end(JSON.stringify(msgs, null, 2));
});
