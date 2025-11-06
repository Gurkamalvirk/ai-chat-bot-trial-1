import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
		label: { type: String, required: true },
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Prompt = mongoose.model('Prompt', promptSchema);
