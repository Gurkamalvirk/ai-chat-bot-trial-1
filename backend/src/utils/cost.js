const PRICING = {
	'openai:gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }, // $ per 1K tokens
	'openai:gpt-4o-mini': { prompt: 0.0003, completion: 0.0006 },
	'gemini:gemini-1.5-flash': { prompt: 0.0002, completion: 0.0004 },
	'mock:mock': { prompt: 0, completion: 0 },
};

export function estimateTokens(text) {
	if (!text) return 0;
	const approx = Math.ceil(text.length / 4); // rough heuristic
	return approx;
}

export function estimateCostCents(provider, model, promptTokens, completionTokens) {
	const key = `${provider}:${model || 'mock'}`;
	const p = PRICING[key] || { prompt: 0.0005, completion: 0.0015 };
	const dollars = (promptTokens / 1000) * p.prompt + (completionTokens / 1000) * p.completion;
	return Math.round(dollars * 100);
}
