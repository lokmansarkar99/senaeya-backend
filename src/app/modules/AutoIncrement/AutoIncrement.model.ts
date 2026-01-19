import { Schema, model } from 'mongoose';
import { IAutoIncrement } from './AutoIncrement.interface';

const AutoIncrementSchema = new Schema<IAutoIncrement>(
     {
          value: { type: Number, required: true, min: 1 },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

AutoIncrementSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

AutoIncrementSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

AutoIncrementSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const AutoIncrement = model<IAutoIncrement>('AutoIncrement', AutoIncrementSchema);
