import mongoose, { Schema } from 'mongoose';
import { IPayroll } from '../types/index.js';

const PayrollSchema = new Schema<IPayroll>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    teamMember: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, trim: true },
    currency: { type: String, default: 'INR', enum: ['INR'], required: true },
    agreedAmount: { type: Number, required: true, min: 0 },
    paymentType: {
      type: String,
      enum: ['fixed', 'percentage', 'per_task', 'hourly'],
      default: 'fixed',
      required: true,
    },
    totalPaid: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

PayrollSchema.index({ project: 1, teamMember: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);
