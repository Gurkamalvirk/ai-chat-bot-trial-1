import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateUserInput } from '../middleware/safety.js';
import { getProvider } from '../providers/index.js';
import { Session } from '../models/Session.js';
import { Message } from '../models/Message.js';
import { enforceDailyQuota } from '../middleware/quota.js';
import { enforceBudget } from '../middleware/budget.js';
import { estimateTokens, estimateCostCents } from '../utils/cost.js';

export const chatRouter = express.Router();

chatRouter.post('/send', requireAuth, enforceDailyQuota, enforceBudget, validateUserInput, async (req, res) => {
	const { sessionId, message, provider = 'openai', model, temperature = 0.7, systemPrompt } = req.body || {};
	if (!message || !sessionId) return res.status(400).json({ error: 'invalid_body' });

	const session = await Session.findById(sessionId);
	if (!session) return res.status(404).json({ error: 'session_not_found' });

	await Message.create({ sessionId, userId: req.user.sub, role: 'user', content: message, provider, model });
	if (systemPrompt) await Message.create({ sessionId, userId: req.user.sub, role: 'system', content: systemPrompt, provider, model });

	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders?.();

	let accumulated = '';
	const stream = async () => {
		const history = await Message.find({ sessionId }).sort({ createdAt: 1 });
		const messages = history.map((m) => ({ role: m.role, content: m.content }));
		const p = getProvider(provider);
		// eslint-disable-next-line no-console
		console.log(`[chat] provider=${provider} model=${model || session.model}`);
		try {
			await p.streamChat({
				messages: model ? messages.map((m) => ({ ...m, model })) : messages,
				model,
				temperature,
				onDelta: async (delta) => {
					accumulated += delta;
					res.write(`data: ${JSON.stringify({ type: 'delta', delta })}\n\n`);
				},
			});
			const promptTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
			const completionTokens = estimateTokens(accumulated);
			const costCents = estimateCostCents(provider, model || session.model, promptTokens, completionTokens);
			await Message.create({ sessionId, userId: req.user.sub, role: 'assistant', content: accumulated, provider, model, tokens: completionTokens, costCents });
			await Session.updateOne({ _id: sessionId }, { $set: { lastActiveAt: new Date(), provider, model } });
			res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
			res.end();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('[chat] provider error', e);
			res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`);
			res.end();
		}
	};

	const heartbeat = setInterval(() => {
		res.write(`:heartbeat\n\n`);
	}, 15000);
	res.on('close', () => clearInterval(heartbeat));
	stream();
});
