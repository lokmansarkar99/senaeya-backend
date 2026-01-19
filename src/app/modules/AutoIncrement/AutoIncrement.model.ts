import { Schema, model } from 'mongoose';
import { IAutoIncrement } from './AutoIncrement.interface';

const AutoIncrementSchema = new Schema<IAutoIncrement>(
     {
          key: {
               type: String,
               required: true,
               unique: true, // VERY IMPORTANT
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

export const AutoIncrement = model<IAutoIncrement>('AutoIncrement', AutoIncrementSchema);
