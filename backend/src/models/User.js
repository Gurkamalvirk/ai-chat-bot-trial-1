import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, unique: true, required: true, index: true },
		passwordHash: { type: String, required: true },
		name: { type: String },
		dailyBudgetCents: { type: Number, default: 500 },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
	},
	{ timestamps: true }
);

export const User = mongoose.model('User', userSchema);
