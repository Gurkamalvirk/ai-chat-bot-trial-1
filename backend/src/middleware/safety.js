const disallowed = [
	/(?:drop\s+table|insert\s+into|select\s+\*\s+from)/i,
	/(?:<script|onerror=|onload=)/i,
	/(?:bomb|kill|how to make.*explosive)/i,
];

export function validateUserInput(req, res, next) {
	const { message } = req.body || {};
	if (typeof message === 'string') {
		for (const rule of disallowed) {
			if (rule.test(message)) return res.status(400).json({ error: 'unsafe_input' });
		}
	}
	next();
}
