import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { issueJwt, requireAuth } from '../middleware/auth.js';

export const authRouter = express.Router();

const credsSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

authRouter.get('/me', requireAuth, async (req, res) => {
	const user = await User.findById(req.user.sub).select({ email: 1, name: 1, role: 1 });
	if (!user) return res.status(401).json({ error: 'unauthorized' });
	return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

authRouter.post('/register', async (req, res) => {
	const parsed = credsSchema.safeParse(req.body || {});
	if (!parsed.success) return res.status(400).json({ error: 'invalid_body' });
	const { email, password, name } = parsed.data;
	const exists = await User.findOne({ email });
	if (exists) return res.status(400).json({ error: 'email_in_use' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ email, passwordHash, name });
	const token = issueJwt(user);
	res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });
	return res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post('/login', async (req, res) => {
	const parsed = credsSchema.safeParse(req.body || {});
	if (!parsed.success) return res.status(400).json({ error: 'invalid_body' });
	const { email, password } = parsed.data;
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ error: 'invalid_login' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ error: 'invalid_login' });
	const token = issueJwt(user);
	res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });
	return res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post('/logout', async (_req, res) => {
	res.clearCookie('token');
	return res.json({ ok: true });
});
