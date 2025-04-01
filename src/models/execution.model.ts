// src/models/execution.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ExecutionResult } from '../types';


export interface ExecutionDocument extends ExecutionResult {}



const ExecutionSchema = new Schema(
  {
    functionId: {
      type: Schema.Types.ObjectId,
      ref: 'Function',
      required: [true, 'Function ID is required'],
    },
    status: {
      type: String,
      required: [true, 'Execution status is required'],
      enum: {
        values: ['success', 'error'],
        message: 'Status must be either success or error',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Execution duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    logs: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
    },
    output: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export model
export default mongoose.model<ExecutionDocument>('Execution', ExecutionSchema);