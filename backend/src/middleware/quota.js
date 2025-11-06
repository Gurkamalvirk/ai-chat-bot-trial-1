import { Message } from '../models/Message.js';

const limit = parseInt(process.env.DAILY_MESSAGE_LIMIT || '500', 10);

export async function enforceDailyQuota(req, res, next) {
	try {
		const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const used = await Message.countDocuments({ userId: req.user.sub, createdAt: { $gte: since } });
		if (used >= limit) return res.status(429).json({ error: 'quota_exceeded', used, limit });
		return next();
	} catch (e) {
		return res.status(500).json({ error: 'quota_check_failed' });
	}
}
