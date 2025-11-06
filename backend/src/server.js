import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { connectDb, ensureTtlIndex } from './utils/db.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { sessionsRouter } from './routes/sessions.js';
import { promptsRouter } from './routes/prompts.js';
import { config } from './utils/config.js';
import { Session } from './models/Session.js';
import { v4 as uuid } from 'uuid';
import { withTiming, getMetrics } from './utils/observability.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use((req, res, next) => {
	req.cid = req.headers['x-cid'] || uuid();
	res.setHeader('x-cid', req.cid);
	next();
});

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(withTiming);

app.use(
	cors({
		origin: config.corsOrigin,
		credentials: true,
	})
);

const limiter = rateLimit({
	windowMs: config.rateLimitWindowMs,
	max: config.rateLimitMax,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

const csrfProtection = csrf({ cookie: true });
app.use('/api/csrf', csrfProtection, (_req, res) => {
	res.json({ csrfToken: res.locals.csrfToken });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/prompts', promptsRouter);

app.get('/api/metrics', requireAuth, (req, res) => {
	if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
	res.json(getMetrics());
});

const port = config.port;

connectDb()
	.then(async () => {
		ensureTtlIndex(Session, 'lastActiveAt', 60 * 60 * 24 * 30);
		app.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`Server listening on :${port}`);
		});
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Failed to connect DB', err);
		process.exit(1);
	});

export default app;
