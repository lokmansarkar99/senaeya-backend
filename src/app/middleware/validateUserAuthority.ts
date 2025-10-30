import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { WorkShop } from '../modules/workShop/workShop.model';
import { IUser } from '../modules/user/user.interface';
import { USER_ROLES } from '../../enums/user';
import { MAX_FREE_INVOICE_COUNT } from '../modules/workShop/workshop.enum';
import { sendNotifications } from '../../helpers/notificationsHelper';
import Settings from '../modules/settings/settings.model';

const validateUserAuthority = () => {
     return async (req: Request, res: Response, next: NextFunction) => {
          try {
               const user = req.user as IUser & { id: string };
               if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN) {
                    const { providerWorkShopId } = req.body;
                    const workShop = await WorkShop.findById(providerWorkShopId).select('ownerId helperUserId subscribedPackage generatedInvoiceCount subscriptionId').populate('subscriptionId');
                    if (!workShop) {
                         throw new Error('Workshop not found');
                    }
                    // prevent trail limit expired or suscription expired
                    if (req.body.sparePartsList || req.body.worksList) {
                         if (!workShop.subscribedPackage) {
                              let maxFreeInvoiceCount = MAX_FREE_INVOICE_COUNT;
                              const workShopSettings = await Settings.findOne({ providerWorkShopId }).select('allowedInvoicesCountForFreeUsers');
                              if (workShopSettings) {
                                   maxFreeInvoiceCount = workShopSettings.allowedInvoicesCountForFreeUsers;
                              }
                              if (workShop.generatedInvoiceCount >= maxFreeInvoiceCount) {
                                   throw new Error('Plz do subscribe');
                              }
                         } else if (workShop.subscribedPackage && workShop.subscriptionId && (workShop as any).subscriptionId.status === 'active') {
                              const currentDate = new Date();
                              const currentPeriodEnd = new Date((workShop as any).subscriptionId.currentPeriodEnd);

                              if (currentDate >= currentPeriodEnd) {
                                   await sendNotifications({
                                        title: `${(workShop as any)?.workshopNameEnglish}`,
                                        receiver: (workShop as any).ownerId._id,
                                        message: `Your subscription to Senaeya app has expired. Please renew your subscription to continue the service.`,
                                        type: 'ALERT',
                                   });
                                   throw new Error(`Your subscription to Senaeya app has expired. Please renew your subscription to continue the service.
                                   انتهى الاشتراك في تطبيق الصناعية .. نرجو منكم تجديد الاشتراك لاستمرار الخدمة.`);
                              }
                         }
                    }
                    if (workShop.ownerId.toString() !== user!.id && workShop.helperUserId!.toString() !== user!.id) {
                         throw new Error('You are not authorized to perform this action');
                    }
               }
               next();
          } catch (error) {
               next(error);
          }
     };
};

export default validateUserAuthority;
