import { model, Schema } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
     {
          // customerId: {
          //      type: String,
          //      required: true,
          // },
          price: {
               type: Number,
               required: true,
          },
          workshop: {
               type: Schema.Types.ObjectId,
               ref: 'WorkShop',
               required: true,
          },
          package: {
               type: Schema.Types.ObjectId,
               ref: 'Package',
               required: true,
          },
          trxId: {
               type: String,
               required: false,
               default: '',
          },
          subscription_qr_code: {
               type: String,
          },
          subscriptionInvoiceAwsLink: {
               type: String,
          },
          amountPaid: {
               type: Number,
               required: true,
          },
          vatPercent: {
               type: Number,
          },
          flatVatAmount: {
               type: Number,
          },
          flatDiscountedAmount: {
               type: Number,
          },
          coupon: {
               type: String,
               required: false,
               default: '',
          },
          contact: {
               type: String,
               required: true,
          },
          currentPeriodStart: {
               type: Date,
               required: true,
          },
          currentPeriodEnd: {
               type: Date,
               required: true,
          },
          status: {
               type: String,
               enum: ['expired', 'active', 'cancel', 'deactivated'],
               default: 'active',
               required: true,
          },
     },
     {
          timestamps: true,
     },
);

export const Subscription = model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);
