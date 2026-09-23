import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types/index.js';

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    description: { type: String, trim: true },
    projectType: { type: String, default: 'Web Application', trim: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    actualEndDate: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      required: true,
    },
    projectValue: { type: Number, required: true, min: 0 },
    projectManager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    technologies: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
