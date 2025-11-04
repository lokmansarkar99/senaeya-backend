import { Model, Types } from 'mongoose';

export type ISubscription = {
     // customerId: string;
     price: number;
     workshop: Types.ObjectId;
     package: Types.ObjectId;
     trxId: string;
     amountPaid: number;
     coupon: string;
     subscription_qr_code?: string;
     contact: string;
     status: 'expired' | 'active' | 'cancel';
     currentPeriodStart: Date;
     currentPeriodEnd: Date;
     createdAt: Date;
     updatedAt: Date;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
