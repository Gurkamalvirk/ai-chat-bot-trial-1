import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../src/utils/db.js';
import { User } from '../src/models/User.js';
import { Session } from '../src/models/Session.js';

async function run() {
	await connectDb();
	const email = 'demo@example.com';
	let user = await User.findOne({ email });
	if (!user) {
		user = await User.create({ email, name: 'Demo', passwordHash: await bcrypt.hash('password', 10) });
	}
	let session = await Session.findOne({ userId: user._id });
	if (!session) session = await Session.create({ userId: user._id, title: 'Demo Chat' });
	// eslint-disable-next-line no-console
	console.log('Seeded:', { user: { email: user.email }, session: { id: session.id } });
	process.exit(0);
}

run();
