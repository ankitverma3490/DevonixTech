import mongoose, { Schema } from 'mongoose';
import { IClient } from '../types/index.js';

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', ClientSchema);
