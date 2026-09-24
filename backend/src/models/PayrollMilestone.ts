import mongoose, { Schema } from 'mongoose';
import { IPayrollMilestone } from '../types/index.js';

const PayrollMilestoneSchema = new Schema<IPayrollMilestone>(
  {
    payroll: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    teamMember: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    currency: { type: String, default: 'INR', enum: ['INR'], required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'wise', 'cash', 'other'],
      default: 'bank_transfer',
    },
    transactionId: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const PayrollMilestone = mongoose.model<IPayrollMilestone>(
  'PayrollMilestone',
  PayrollMilestoneSchema
);
