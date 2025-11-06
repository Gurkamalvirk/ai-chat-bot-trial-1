import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Prompt } from '../models/Prompt.js';

export const promptsRouter = express.Router();

promptsRouter.use(requireAuth);

promptsRouter.get('/', async (req, res) => {
	const prompts = await Prompt.find({ userId: req.user.sub }).sort({ updatedAt: -1 });
	res.json({ prompts });
});

promptsRouter.post('/', async (req, res) => {
	const { label, content } = req.body || {};
	if (!label || !content) return res.status(400).json({ error: 'invalid_body' });
	const prompt = await Prompt.create({ userId: req.user.sub, label, content });
	res.json({ prompt });
});

promptsRouter.delete('/:id', async (req, res) => {
	const { id } = req.params;
	await Prompt.deleteOne({ _id: id, userId: req.user.sub });
	res.json({ ok: true });
});
