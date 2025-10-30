import { Schema, model } from 'mongoose';
import { Imessage } from './message.interface';
import { MessageStatus } from './message.enum';

const MessageSchema = new Schema<Imessage>({
     providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
     message: { type: String, required: true },
     data: { type: [Object], required: true },
     name: { type: String,required: false },
     contact: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
     status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.OPEN },
}, { timestamps: true });

MessageSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

MessageSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

MessageSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const Message = model<Imessage>('Message', MessageSchema);
