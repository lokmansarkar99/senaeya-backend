import { Schema, model } from 'mongoose';
import { IAutoIncrement } from './AutoIncrement.interface';

const AutoIncrementSchema = new Schema<IAutoIncrement>(
     {
          key: {
               type: String,
               required: true,
               index: true,
          },
          workshopId: {
               type: String,
               required: false,
               index: true,
          },
          value: {
               type: Number,
               default: 0,
               min: 0,
          },
     },
     { timestamps: true },
);

/**
 * ❌ DO NOT use soft-delete hooks here
 * Counters must always be visible
 */

// Create compound index for key + workshopId to ensure uniqueness
AutoIncrementSchema.index({ key: 1, workshopId: 1 }, { unique: true });

export const AutoIncrement = model<IAutoIncrement>('AutoIncrement', AutoIncrementSchema);
