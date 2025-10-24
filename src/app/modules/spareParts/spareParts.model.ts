import { Schema, model } from 'mongoose';
import { ISpareParts } from './spareParts.interface';
import { WorkType } from './spareParts.enum';

const SparePartsSchema = new Schema<ISpareParts>(
     {
          title: { type: {
               ar: String,
               bn: String,
               ur: String,
               hi: String,
               tl: String,
               en: String,
          }, required: true },
          providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
          type: { type: String, enum: Object.values(WorkType), required: true, default: WorkType.SPARE_PART},
          code: { type: String, required: true, unique: true },
          cost: { type: Number, required: false, min: 0 },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

SparePartsSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

SparePartsSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

SparePartsSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const SpareParts = model<ISpareParts>('SpareParts', SparePartsSchema);
