import { Schema, model } from 'mongoose';
import { IcheckPhoneNumber } from './checkPhoneNumber.interface';

const CheckPhoneNumberSchema = new Schema<IcheckPhoneNumber>({
     phoneNumber: { type: String, required: true },
     otp: { type: Number },
     isVerified: { type: Boolean, default: false },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

CheckPhoneNumberSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CheckPhoneNumberSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CheckPhoneNumberSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const CheckPhoneNumber = model<IcheckPhoneNumber>('CheckPhoneNumber', CheckPhoneNumberSchema);
