// src/models/function.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { FunctionMetadata } from '../types';

// Create interface extending the Document type
export interface FunctionDocument extends FunctionMetadata {}

// Create schema
const FunctionSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Function name is required'],
      trim: true,
      maxlength: [50, 'Function name cannot be more than 50 characters'],
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: {
        values: ['python', 'javascript'],
        message: 'Language must be either python or javascript',
      },
    },
    code: {
      type: String,
      required: [true, 'Function code is required'],
    },
    route: {
      type: String,
      required: [true, 'Function route is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function(value: string) {
          return /^\/[a-zA-Z0-9\-\_\/]*$/.test(value);
        },
        message: 'Route must start with / and contain only alphanumeric characters, hyphens, and underscores',
      },
    },
    virtualizationType: {
      type: String,
      required: [true, 'virtualizationType is required'],
    },
    timeout: {
      type: Number,
      required: [false, 'Timeout setting is required'],
      default: 30000, // 30 seconds in milliseconds
      min: [100, 'Timeout must be at least 100 ms'],
      max: [300000, 'Timeout cannot exceed 5 minutes'],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export model
export default mongoose.model<FunctionDocument>('Function', FunctionSchema);