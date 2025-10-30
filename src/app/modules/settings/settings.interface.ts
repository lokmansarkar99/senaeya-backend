import { Document, Types } from 'mongoose';

// Define the interface for your settings
export interface ISettings extends Document {
     providerWorkShopId?: Types.ObjectId | undefined; // null is for app settings and not null is for specific provider settings
     workShopDiscount?: number | undefined; // for specific provider settings it not for app settings
     // for app ⬇️⬇️⬇️
     privacyPolicy: string;
     aboutUs: string;
     support: string;
     termsOfService: string;
     allowedInvoicesCountForFreeUsers: number;
     defaultVat: number;
}
