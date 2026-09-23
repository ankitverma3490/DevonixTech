import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types/index.js';

const ExpenseSchema = new Schema<IExpense>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'hosting',
        'domain',
        'api',
        'software',
        'marketing',
        'equipment',
        'travel',
        'other',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal', 'cash', 'other'],
      default: 'credit_card',
    },
    description: { type: String, trim: true },
    receipt: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
