import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
		title: { type: String },
		provider: { type: String, default: 'openai' },
		model: { type: String, default: 'gpt-3.5-turbo' },
		lastActiveAt: { type: Date, default: () => new Date(), index: true },
		meta: { type: Object },
	},
	{ timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
