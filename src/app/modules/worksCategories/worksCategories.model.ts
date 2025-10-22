import { Schema, model } from 'mongoose';
import { IworksCategories } from './worksCategories.interface';

const WorksCategoriesSchema = new Schema<IworksCategories>(
     {
          image: { type: String, required: false },
          workCategoryName: { type: String, required: true, unique: true },
          title: {
               type: {
                    ar: String,
                    bn: String,
                    ur: String,
                    hi: String,
                    tl: String,
                    en: String,
               },
               required: false,
          },
          description: {
               type: {
                    ar: String,
                    bn: String,
                    ur: String,
                    hi: String,
                    tl: String,
                    en: String,
               },
               required: false,
          },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

WorksCategoriesSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

WorksCategoriesSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

WorksCategoriesSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const WorksCategories = model<IworksCategories>('WorksCategories', WorksCategoriesSchema);
