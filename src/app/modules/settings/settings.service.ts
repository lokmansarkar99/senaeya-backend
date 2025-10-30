import path from 'path';
import { ISettings } from './settings.interface';
import Settings from './settings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

const upsertSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
     const existingSettings = await Settings.findOne({ providerWorkShopId: null });
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({ providerWorkShopId: null }, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          if (!data.allowedInvoicesCountForFreeUsers) {
               data.allowedInvoicesCountForFreeUsers = 0;
          }
          if (!data.defaultVat) {
               data.defaultVat = 0;
          }
          const newSettings = await Settings.create(data);
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};
const getSettings = async (title: string) => {
     const settings: any = await Settings.findOne({ providerWorkShopId: null }).select(title);
     if (title && settings[title]) {
          return settings[title];
     }
     return settings;
};

const getTermsOfService = async () => {
     const settings: any = await Settings.findOne({ providerWorkShopId: null });
     if (!settings) {
          return '';
     }
     return settings.termsOfService;
};
const getSupport = async () => {
     const settings: any = await Settings.findOne({ providerWorkShopId: null });

     if (!settings) {
          return '';
     }
     return settings.support;
};
const getPrivacyPolicy = async () => {
     const settings: any = await Settings.findOne({ providerWorkShopId: null });

     if (!settings) {
          return '';
     }
     return settings.privacyPolicy;
};
const getAboutUs = async () => {
     const settings: any = await Settings.findOne({ providerWorkShopId: null });

     if (!settings) {
          return '';
     }
     return settings.aboutUs;
};

// const getPrivacyPolicy = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'privacyPolicy.html');
// };

const getAccountDelete = async () => {
     return path.join(__dirname, '..', 'htmlResponse', 'accountDelete.html');
};

// const getSupport = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'support.html');
// };

const addWorkshopSetting = async (data: Partial<ISettings>) => {
     const existingSettings = await Settings.findOne({ providerWorkShopId: data.providerWorkShopId });
     const workShopSettingsDTO = {
          providerWorkShopId: data.providerWorkShopId,
          workShopDiscount: data.workShopDiscount,
          allowedInvoicesCountForFreeUsers: data.allowedInvoicesCountForFreeUsers || undefined,
          defaultVat: data.defaultVat || undefined,
          privacyPolicy: data.privacyPolicy || undefined,
          aboutUs: data.aboutUs || undefined,
          support: data.support || undefined,
          termsOfService: data.termsOfService || undefined,
     };
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({ providerWorkShopId: data.providerWorkShopId }, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          const newSettings = await Settings.create(data);
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};

const getWorkshopSetting = async (providerWorkShopId: string) => {
     const settings = await Settings.findOne({ providerWorkShopId });
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings;
};

export const settingsService = {
     addWorkshopSetting,
     getWorkshopSetting,
     upsertSettings,
     getSettings,
     getPrivacyPolicy,
     getAccountDelete,
     getSupport,
     getTermsOfService,
     getAboutUs,
};
