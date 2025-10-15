import { model, Schema } from "mongoose";
import { Ipayment } from "./payment.interface";
import { PaymentMethod, PaymentStatus } from "./payment.enum";

const PaymentSchema = new Schema<Ipayment>({
     providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
     invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, unique: true },
     paymentMethod: { type: String, enum: PaymentMethod, required: true },
     paymentStatus: { type: String, enum: PaymentStatus, required: true },
     amount: { type: Number, required: true },
     isCashRecieved: { type: Boolean, required: false, default: null },
     cardApprovalCode: { type: String, required: false, default: null },
     isRecievedTransfer: { type: Boolean, required: false, default: null },
     postPaymentDate: { type: Date, required: false, default: null },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

// Prevent duplicate payments per invoice per workshop (ignoring soft-deleted docs)
PaymentSchema.index(
     { providerWorkShopId: 1, invoice: 1 },
     { unique: true, partialFilterExpression: { isDeleted: false } },
);

PaymentSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

PaymentSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

PaymentSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Payment = model<Ipayment>('Payment', PaymentSchema);
