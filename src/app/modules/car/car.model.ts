import { Schema, model } from 'mongoose';
import { ICar } from './car.interface';
import { CLIENT_CAR_TYPE } from '../client/client.enum';
const CarSchema = new Schema<ICar>(
     {
          providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
          brand: { type: Schema.Types.ObjectId, ref: 'CarBrand', required: true },
          model: { type: Schema.Types.ObjectId, ref: 'CarModel', required: true },
          year: { type: String, required: true },
          vin: { type: String, required: true, unique: false },
          client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
          image: { type: String, required: false },
          description: { type: String, required: false },
          carType: { type: String, enum: CLIENT_CAR_TYPE, required: true },
          plateNumberForInternational: { type: String, required: false, index: true },
          slugForSaudiCarPlateNumber: {
               type: String,
               required: function (this: any) {
                    return this.carType === CLIENT_CAR_TYPE.SAUDI;
               },
               index: true,
               default: null,
          }, // null for international car
          plateNumberForSaudi: {
               type: {
                    symbol: { type: Schema.Types.ObjectId, ref: 'Image', required: false },
                    numberEnglish: { type: String, required: false },
                    numberArabic: { type: String, required: false },
                    alphabetsCombinations: { type: [String], required: false },
               },
               required: false,
               index: true,
          },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

CarSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CarSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CarSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Car = model<ICar>('Car', CarSchema);
