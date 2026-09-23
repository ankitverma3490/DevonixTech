import mongoose, { Schema } from 'mongoose';
import { IClientPayment } from '../types/index.js';

const ClientPaymentSchema = new Schema<IClientPayment>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date },
    dueDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'stripe', 'paypal', 'wire', 'card', 'cash', 'other'],
      default: 'bank_transfer',
    },
    transactionId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partially_paid'],
      default: 'pending',
      required: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const ClientPayment = mongoose.model<IClientPayment>(
  'ClientPayment',
  ClientPaymentSchema
);
