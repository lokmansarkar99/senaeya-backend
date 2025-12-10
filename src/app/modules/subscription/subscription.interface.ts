import { Model, Types } from 'mongoose';

export type ISubscription = {
     // customerId: string;
     _id?: string;
     price: number;
     workshop: Types.ObjectId;
     package: Types.ObjectId;
     trxId: string;
     amountPaid: number;
     vatPercent?: number;
     flatVatAmount?: number;
     flatDiscountedAmount?: number;
     coupon: string;
     subscription_qr_code?: string;
     subscriptionInvoiceAwsLink?: string;
     contact: string;
     status: 'expired' | 'active' | 'cancel';
     currentPeriodStart: Date;
     currentPeriodEnd: Date;
     createdAt: Date;
     updatedAt: Date;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
