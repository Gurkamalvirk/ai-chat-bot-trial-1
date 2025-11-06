import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// CORS configuration: allow same-origin in production, or configured origin in development
const corsOptions = {
	origin: config.nodeEnv === 'production' 
		? true // Allow same-origin requests in production
		: config.corsOrigin,
	credentials: true,
};
app.use(cors(corsOptions));

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

// Serve static files from the Vite build output
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
	// Don't serve index.html for API routes
	if (req.path.startsWith('/api')) {
		return res.status(404).json({ error: 'Not found' });
	}
	res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const port = process.env.PORT || config.port;

connectDb()
	.then(async () => {
		ensureTtlIndex(Session, 'lastActiveAt', 60 * 60 * 24 * 30);
		app.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`Server listening on port ${port}`);
		});
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Failed to connect DB', err);
		process.exit(1);
	});

export default app;
