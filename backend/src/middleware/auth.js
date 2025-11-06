import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';

export function issueJwt(user) {
	const payload = { sub: String(user._id), email: user.email, role: user.role };
	return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
	const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
	if (!token) return res.status(401).json({ error: 'unauthorized' });
	try {
		const decoded = jwt.verify(token, config.jwtSecret);
		req.user = decoded;
		next();
	} catch (_e) {
		return res.status(401).json({ error: 'invalid_token' });
	}
}
