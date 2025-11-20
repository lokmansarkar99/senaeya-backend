import { Schema, model } from 'mongoose';
import { IcarModel } from './carModel.interface';

const CarModelSchema = new Schema<IcarModel>({
     brand: { type: Schema.Types.ObjectId, ref: 'CarBrand', required: true },
     title: { type: String,required: true },
     description: { type: String,required: false },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

CarModelSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CarModelSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CarModelSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const CarModel = model<IcarModel>('CarModel', CarModelSchema);
