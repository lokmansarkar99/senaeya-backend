import { Model } from 'mongoose';

export type IPackage = {
     title: string; // "Standard"
     description: string;
     price: number;
     duration: '1 month' | '3 months' | '6 months' | '1 year';
     paymentType: 'Monthly' | 'Yearly';
     subscriptionType: 'app' | 'web';
     status: 'active' | 'inactive';
     isDeleted: boolean;
};

export type PackageModel = Model<IPackage, Record<string, unknown>>;
