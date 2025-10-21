import { Schema, model } from 'mongoose';
import { Iwork } from './work.interface';
import { WorkType } from './work.enum';

const WorkSchema = new Schema<Iwork>(
     {
          title: { type: {
               ar: String,
               bn: String,
               ur: String,
               hi: String,
               tl: String,
               en: String,
          }, required: true },
          worksCategories: { type: Schema.Types.ObjectId, ref: 'WorksCategories', required: true },
          type: { type: String, enum: Object.values(WorkType), required: true, default: '' },
          code: { type: String, required: true, unique: true },
          cost: { type: Number, required: true, min: 0 },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

WorkSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

WorkSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

WorkSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Work = model<Iwork>('Work', WorkSchema);
