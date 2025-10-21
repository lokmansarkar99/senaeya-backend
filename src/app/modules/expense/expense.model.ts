import { Schema, model } from 'mongoose';
import { Iexpense } from './expense.interface';

const ExpenseSchema = new Schema<Iexpense>({
     providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
     title: { type: String, required: true },
     amount: { type: Number,required: true },
     spendingDate: { type: Date,required: true },
     description: { type: String,required: false },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

ExpenseSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ExpenseSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ExpenseSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const Expense = model<Iexpense>('Expense', ExpenseSchema);
