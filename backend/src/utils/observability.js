const metrics = {
	requests: 0,
	errors: 0,
	latencyMsP50: 0,
	latencyMsP95: 0,
	lastLatencies: [],
};

export function withTiming(req, res, next) {
	metrics.requests += 1;
	const start = Date.now();
	res.on('finish', () => {
		const ms = Date.now() - start;
		metrics.lastLatencies.push(ms);
		if (metrics.lastLatencies.length > 200) metrics.lastLatencies.shift();
		const sorted = [...metrics.lastLatencies].sort((a, b) => a - b);
		const p = (q) => sorted[Math.max(0, Math.floor((q / 100) * (sorted.length - 1)))];
		metrics.latencyMsP50 = p(50) || ms;
		metrics.latencyMsP95 = p(95) || ms;
	});
	res.on('close', () => undefined);
	next();
}

export function recordError() {
	metrics.errors += 1;
}

export function getMetrics() {
	return { ...metrics };
}
