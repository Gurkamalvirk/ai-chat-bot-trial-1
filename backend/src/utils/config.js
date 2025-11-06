export const config = {
	port: parseInt(process.env.PORT || '4000', 10),
	nodeEnv: process.env.NODE_ENV || 'development',
	mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_chat',
	jwtSecret: process.env.JWT_SECRET || 'change_me',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
	rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
	providerDefault: process.env.PROVIDER_DEFAULT || 'openai',
	featureToolCalls: (process.env.FEATURE_TOOL_CALLS || 'false') === 'true',
	budgetDailyCents: parseInt(process.env.BUDGET_DAILY_CENTS || '500', 10),
	summarizationModel: process.env.SUMMARIZATION_MODEL || 'gpt-3.5-turbo',
	summarizationTargetTokens: parseInt(process.env.SUMMARIZATION_TARGET_TOKENS || '1200', 10),
};
