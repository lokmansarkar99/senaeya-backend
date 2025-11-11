import { Model } from 'mongoose';
import { PackageDuration, PackagePaymentType, PackageSubscriptionType, PackageStatus } from './package.enum';

export type IPackage = {
     title: string; // "Standard"
     description: string;
     features: string[];
     monthlyBasePrice: number;
     yearlyBasePrice: number;
     price: number;
     cutOffprice: number;
     duration: PackageDuration;
     paymentType: PackagePaymentType;
     subscriptionType: PackageSubscriptionType;
     status: PackageStatus;
     discountPercentage: number;
     isDeleted: boolean;
};

export type PackageModel = Model<IPackage, Record<string, unknown>>;
