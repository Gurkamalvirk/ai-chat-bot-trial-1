import mongoose from 'mongoose';
import { config } from './config.js';

let memServer = null;

export async function connectDb() {
	mongoose.set('strictQuery', true);
	try {
		await mongoose.connect(config.mongoUri, {
			serverSelectionTimeoutMS: 8000,
		});
		return;
	} catch (_e) {
		if (config.nodeEnv !== 'development') throw _e;
		const { MongoMemoryServer } = await import('mongodb-memory-server');
		memServer = await MongoMemoryServer.create();
		const uri = memServer.getUri();
		await mongoose.connect(uri);
	}
}

export function ensureTtlIndex(model, field, expireAfterSeconds) {
	model.collection.createIndex({ [field]: 1 }, { expireAfterSeconds }).catch(() => undefined);
}

export async function stopMemDb() {
	if (memServer) await memServer.stop();
}
