import { Schema, model } from 'mongoose';
import { IcarBrandCountries } from './carBrandCountries.interface';

const CarBrandCountriesSchema = new Schema<IcarBrandCountries>(
     {
          image: { type: String, required: true },
          title: { type: String, required: true, unique: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

CarBrandCountriesSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CarBrandCountriesSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CarBrandCountriesSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const CarBrandCountries = model<IcarBrandCountries>('CarBrandCountries', CarBrandCountriesSchema);
