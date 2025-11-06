import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { config } from '../utils/config.js';

export async function enforceBudget(req, res, next) {
	try {
		const user = await User.findById(req.user.sub);
		if (!user) return res.status(401).json({ error: 'unauthorized' });
		const cap = user.dailyBudgetCents ?? config.budgetDailyCents;
		const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const agg = await Message.aggregate([
			{ $match: { userId: user._id, createdAt: { $gte: since } } },
			{ $group: { _id: null, total: { $sum: { $ifNull: ['$costCents', 0] } } } },
		]);
		const used = agg[0]?.total || 0;
		if (used >= cap) return res.status(402).json({ error: 'budget_exceeded', used, cap });
		return next();
	} catch (e) {
		return res.status(500).json({ error: 'budget_check_failed' });
	}
}
