import { Schema, model } from 'mongoose';
import { ISpareParts } from './spareParts.interface';
import { SparePartType } from './spareParts.enum';

const SparePartsSchema = new Schema<ISpareParts>(
     {
          title: {
               type: {
                    ar: String,
                    bn: String,
                    ur: String,
                    hi: String,
                    tl: String,
                    en: String,
               },
               required: true,
          },
          itemName: { type: String, required: true },
          providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: false, default: null },
          type: { type: String, enum: Object.values(SparePartType), required: true, default: SparePartType.SPARE_PART },
          code: { type: String, required: true, lowerCase: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);
SparePartsSchema.index({ code: 1 }, { unique: true });

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
