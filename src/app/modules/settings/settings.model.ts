import { Schema, Types, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
     {
          providerWorkShopId: {
               type: Types.ObjectId,
               ref: 'WorkShop',
               default: undefined, // null for app settings and not null for specific provider settings
               unique: true,
          },
          workShopDiscount: {
               type: Number,
               default: undefined,
          },
          privacyPolicy: {
               type: String,
          },
          warrantyAndTerms: {
               type: String,
          },
          aboutUs: {
               type: String,
          },
          support: {
               type: String,
          },
          termsOfService: {
               type: String,
          },
          allowedInvoicesCountForFreeUsers: {
               type: Number,
          },
          defaultVat: {
               type: Number,
          },
          socialMedia: {
               type: Object,
          },
     },
     { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
