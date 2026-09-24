import mongoose, { Schema } from 'mongoose';
import { IClientPayment } from '../types/index.js';

const ClientPaymentSchema = new Schema<IClientPayment>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    exchangeRate: { type: Number, default: 1, min: 0 },
    inrAmount: { type: Number, default: 0, min: 0 },
    requiresExchangeRateUpdate: { type: Boolean, default: false },
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

ClientPaymentSchema.pre('save', function (next) {
  if (this.currency === 'INR') {
    this.exchangeRate = 1;
    this.inrAmount = this.amount;
  } else {
    if (!this.exchangeRate || this.exchangeRate <= 0) {
      this.exchangeRate = 88;
    }
    this.inrAmount = Math.round(this.amount * this.exchangeRate * 100) / 100;
  }
  next();
});

export const ClientPayment = mongoose.model<IClientPayment>(
  'ClientPayment',
  ClientPaymentSchema
);
