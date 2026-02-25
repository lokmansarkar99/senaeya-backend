import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IworkShop } from './workShop.interface';
import { WorkShop } from './workShop.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { sendToTopic } from '../pushNotification/pushNotification.service';
import DeviceToken from '../DeviceToken/DeviceToken.model';
import mongoose from 'mongoose';

const createWorkShop = async (payload: IworkShop, user: any): Promise<IworkShop> => {
     //Three fields can be added from the administration, including: the name of the region, the name of the city, and the name of the industrial complex in which the workshop is located. This data is obtained from the workshop location specified in the application and entered manually.
     if (user.role === USER_ROLES.WORKSHOP_OWNER) {
          const forbiddenFieldsForShopOwner = ['region', 'city', 'industrialComplexAreaName'];

          for (const field of forbiddenFieldsForShopOwner) {
               if (Object.prototype.hasOwnProperty.call(payload, field)) {
                    throw new AppError(StatusCodes.BAD_REQUEST, `WorkShop owner cannot create 'region', 'city', 'industrialComplexAreaName'. Plz connect to shop owner.`);
               }
          }
     }
     const userIs = await User.findById(user.id);
     if (userIs?.helperUserId) {
          payload.helperUserId = userIs.helperUserId;
     }
     if (!payload.contact) {
          payload.contact = user.contact;
     }
     if (payload.contact) {
          const isExistWorkshopByContact = await WorkShop.findOne({ contact: payload.contact });
          if (isExistWorkshopByContact) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'WorkShop already exists with this phone.');
          }
     }
     payload.ownerId = user.id;
     const result = await WorkShop.create(payload);
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'WorkShop not found.');
     }

     await sendNotifications({
          title: `${userIs?.name}`,
          receiver: user.id,
          message: `The workshop has been successfully registered.`,
          message_ar: `تم تسجيل الورشة بنجاح`,
          message_bn: `কর্মশালাটি সফলভাবে নিবন্ধিত হয়েছে।`,
          message_tl: `Matagumpay na nairehistro ang workshop`,
          message_hi: `कार्यशाला का पंजीकरण सफलतापूर्वक हो चुका है।`,
          message_ur: `ورکشاپ کامیابی کے ساتھ رجسٹر ہو چکی ہے۔`,
          type: 'ALERT',
     });

     if (user.id) {
          const existingToken = await DeviceToken.findOne({
               userId: new mongoose.Types.ObjectId(user.id),
          });
          if (existingToken && existingToken.fcmToken) {
               await sendToTopic({
                    token: existingToken.fcmToken,
                    title: 'Workshop Registration',
                    body: `The workshop has been successfully registered.`,
                    data: {
                         title: `${userIs?.name}`,
                         receiver: user.id,
                         message: `The workshop has been successfully registered.`,
                         message_ar: `تم تسجيل الورشة بنجاح`,
                         message_bn: `কর্মশালাটি সফলভাবে নিবন্ধিত হয়েছে।`,
                         message_tl: `Matagumpay na nairehistro ang workshop`,
                         message_hi: `कार्यशाला का पंजीकरण सफलतापूर्वक हो चुका है।`,
                         message_ur: `ورکشاپ کامیابی کے ساتھ رجسٹر ہو چکی ہے۔`,
                         type: 'ALERT',
                    },
               });
          }
     }
     return result;
};

const getAllWorkShops = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IworkShop[] }> => {
     const queryBuilder = new QueryBuilder(WorkShop.find().populate('subscriptionId', 'status').populate('ownerId', 'name nationality preferredLanguage'), query);
     const result = await queryBuilder.filter().search(['contact', 'workshopNameEnglish', 'workshopNameArabic', 'unn', 'crn', 'mln', 'taxVatNumber']).sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedWorkShops = async (): Promise<IworkShop[]> => {
     const result = await WorkShop.find();
     return result;
};

const updateWorkShop = async (id: string, payload: Partial<IworkShop>, user: any): Promise<IworkShop | null> => {
     console.log('🚀 ~ updateWorkShop ~ payload:', payload);
     if (user.role === USER_ROLES.WORKSHOP_OWNER) {
          const forbiddenFieldsForShopOwner = ['workshopNameArabic', 'unn', 'crn', 'mln', 'region', 'city', 'industrialComplexAreaName'];

          for (const field of forbiddenFieldsForShopOwner) {
               if (Object.prototype.hasOwnProperty.call(payload, field)) {
                    throw new AppError(StatusCodes.BAD_REQUEST, `WorkShop owner cannot update 'workshopNameArabic', 'unn', 'crn', 'mln'. Plz connect to shop owner.`);
               }
          }
     }

     const isExistWorkshop = await WorkShop.findById(id);
     if (!isExistWorkshop) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'WorkShop not found.');
     }

     if (user.role === USER_ROLES.WORKSHOP_OWNER) {
          if (isExistWorkshop.ownerId.toString() !== user.id.toString()) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this workShop.');
          }
     }

     if (isExistWorkshop.image) {
          unlinkFile(isExistWorkshop.image);
     }
     await WorkShop.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

     await sendNotifications({
          title: `${isExistWorkshop?.workshopNameEnglish}`,
          receiver: isExistWorkshop.ownerId,
          message: `Workshop data has been modified successfully.`,
          message_ar: `تم تعديل بيانات الورشة بنجاح`,
          message_bn: `কর্মশালার তথ্য সফলভাবে পরিবর্তন করা হয়েছে।`,
          message_tl: `Matagumpay na nabago ang datos ng workshop`,
          message_hi: `कार्यशाला का डेटा सफलतापूर्वक संशोधित कर दिया गया है।`,
          message_ur: `ورکشاپ کے ڈیٹا میں کامیابی کے ساتھ ترمیم کی گئی ہے۔`,
          type: 'ALERT',
     });

     if (isExistWorkshop.ownerId) {
          const existingToken = await DeviceToken.findOne({
               userId: isExistWorkshop.ownerId,
          });
          if (existingToken && existingToken.fcmToken) {
               await sendToTopic({
                    token: existingToken.fcmToken,
                    title: 'Workshop Data Modification',
                    body: `Workshop data has been modified successfully.`,
                    data: {
                         title: `${isExistWorkshop?.workshopNameEnglish}`,
                         receiver: isExistWorkshop.ownerId.toString(),
                         message: `Workshop data has been modified successfully.`,
                         message_ar: `تم تعديل بيانات الورشة بنجاح`,
                         message_bn: `কর্মশালার তথ্য সফলভাবে পরিবর্তন করা হয়েছে।`,
                         message_tl: `Matagumpay na nabago ang datos ng workshop`,
                         message_hi: `कार्यशाला का डेटा सफलतापूर्वक संशोधित कर दिया गया है।`,
                         message_ur: `ورکشاپ کے ڈیٹا میں کامیابی کے ساتھ ترمیم کی گئی ہے۔`,
                         type: 'ALERT',
                    },
               });
          }
     }
     return await WorkShop.findById(id);
};

const deleteWorkShop = async (id: string): Promise<IworkShop | null> => {
     const result = await WorkShop.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'WorkShop not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteWorkShop = async (id: string): Promise<IworkShop | null> => {
     const result = await WorkShop.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'WorkShop not found.');
     }
     if (result.image) {
          unlinkFile(result.image);
     }
     return result;
};

const getWorkShopById = async (id: string): Promise<IworkShop | null> => {
     const result = await WorkShop.findById(id).populate('ownerId', 'name nationality preferredLanguage');
     return result;
};

const getWorkShopByContact = async (contact: string): Promise<IworkShop | null> => {
     const result = await WorkShop.findOne({ contact: contact.trim() });
     return result;
};

const getWorkShopBycrnMlnUnnTax = async (crn: string, mln: string, unn: string, taxVatNumber: string) => {
     const isExistWorkshopByMln = await WorkShop.findOne({ mln });
     const isExistWorkshopByUnn = await WorkShop.findOne({ unn });
     let isExistWorkshopByTax = null;
     if (taxVatNumber) {
          isExistWorkshopByTax = await WorkShop.findOne({ taxVatNumber });
     }
     const isExistWorkshopByCrn = await WorkShop.findOne({ crn });

     return {
          isExistWorkshopByCrn: !!isExistWorkshopByCrn,
          isExistWorkshopByTax: taxVatNumber ? !!isExistWorkshopByTax : undefined,
          isExistWorkshopByUnn: !!isExistWorkshopByUnn,
          isExistWorkshopByMln: !!isExistWorkshopByMln,
     };
};

const isWorkshop = async (user: any): Promise<boolean> => {
     console.log('🚀 ~ isWorkshop ~ user:', user);
     const result = await WorkShop.findOne({ ownerId: user.id });
     if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'WorkShop not found.');

     console.log('result', result);
     console.log('result?.taxVatNumber?.length', result?.taxVatNumber?.length);
     return false;
};

export const workShopService = {
     createWorkShop,
     getAllWorkShops,
     getAllUnpaginatedWorkShops,
     updateWorkShop,
     deleteWorkShop,
     hardDeleteWorkShop,
     getWorkShopById,
     getWorkShopByContact,
     getWorkShopBycrnMlnUnnTax,
     isWorkshop
};
