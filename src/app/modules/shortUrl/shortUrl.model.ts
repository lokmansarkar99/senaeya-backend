import { Schema, model } from 'mongoose';
import { IshortUrl } from './shortUrl.interface';

const ShortUrlSchema = new Schema<IshortUrl>(
     {
          shortUrl: { type: String, required: true, unique: true, immutable: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

ShortUrlSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ShortUrlSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ShortUrlSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const ShortUrl = model<IshortUrl>('ShortUrl', ShortUrlSchema);
