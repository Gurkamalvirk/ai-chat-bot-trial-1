import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
		role: { type: String, enum: ['system', 'user', 'assistant', 'tool'], required: true },
		content: { type: String, required: true },
		provider: { type: String },
		model: { type: String },
		tokens: { type: Number },
		costCents: { type: Number, default: 0 },
		meta: { type: Object },
	},
	{ timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
