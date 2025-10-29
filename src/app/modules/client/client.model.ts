import { Schema, model } from 'mongoose';
import { IClient } from './client.interface';
import { CLIENT_TYPE, CLIENT_STATUS } from './client.enum';

const ClientSchema = new Schema<IClient>({
     providerWorkShopId:{ type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
     clientType: { type: String, enum: CLIENT_TYPE, required: true },
     clientId: { type: String, refPath: 'clientType', required: true, unique: true },
     contact: { type: String, required: true, index: true },
     cars: { type: [Schema.Types.ObjectId], ref: 'Car', required: true, default: [] },
     invoices: { type: [Schema.Types.ObjectId], ref: 'Invoice', required: true, default: [] },
     document: { type: String, required: false, default: null },
     documentNumber: { type: String, required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
     status: { type: String, enum: CLIENT_STATUS, default: CLIENT_STATUS.ACTIVE },
}, { timestamps: true });

ClientSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ClientSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ClientSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const Client = model<IClient>('Client', ClientSchema);
