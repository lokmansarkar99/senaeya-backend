import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { paymentService } from '../payment/payment.service';
import { ObjectId } from 'mongodb';
import { releaseInvoiceToWhatsApp } from '../payment/payment.utils';
import { WorkShop } from '../workShop/workShop.model';
import { MAX_FREE_INVOICE_COUNT } from '../workShop/workshop.enum';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { sparePartsService } from '../spareParts/spareParts.service';
import { SpareParts } from '../spareParts/spareParts.model';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';
import mongoose from 'mongoose';

const createInvoice = async (payload: Partial<IInvoice>) => {
     if (payload.paymentMethod !== PaymentMethod.POSTPAID) {
          payload.postPaymentDate = null;
     } else {
          // convert payload.postPaymentDate string to Date
          if (payload.postPaymentDate && typeof payload.postPaymentDate === 'string') {
               payload.postPaymentDate = new Date(payload.postPaymentDate);
               // check its not in the past
               if (payload.postPaymentDate < new Date()) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Post Payment Date cannot be in the past');
               }
          }
     }
     try {
          if (payload.sparePartsList) {
               // Process all spare parts in parallel and wait for all to complete
               await Promise.all(
                    payload.sparePartsList.map(async (sparePart) => {
                         try {
                              // Check if spare part with this code already exists
                              const existingSparePart = await SpareParts.findOne({
                                   code: sparePart.code.toLowerCase(),
                                   itemName: sparePart.itemName,
                              });

                              if (!existingSparePart) {
                                   const title = await buildTranslatedField(sparePart.itemName);
                                   const sparePartData = {
                                        providerWorkShopId: payload.providerWorkShopId,
                                        item: sparePart.itemName,
                                        code: sparePart.code.toLowerCase(),
                                        title,
                                   };

                                   const newSparePart = await SpareParts.create(sparePartData);

                                   if (!newSparePart) {
                                        throw new AppError(StatusCodes.NOT_FOUND, 'Spare part not found*.**.');
                                   }
                              }
                         } catch (error) {
                              console.error('Error saving spare part:', error);
                              // Continue with other spare parts even if one fails
                         }
                    }),
               );
          }
          const invoice = new Invoice(payload);
          // Validate the order data
          await invoice.validate();

          // throw new Error("test");

          const result = await invoice.save();

          if (!result) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.**..');
          }
          // get the workshop
          const workshop = await WorkShop.findById(result.providerWorkShopId).select('subscribedPackage generatedInvoiceCount subscriptionId').populate('subscriptionId');
          if (!workshop!.subscribedPackage) {
               workshop!.generatedInvoiceCount += 1;
               await workshop!.save();
          }
          const populatedResult = await Invoice.findById(result._id)
               .populate({
                    path: 'providerWorkShopId',
                    select: 'workshopNameEnglish workshopNameArabic bankAccountNumber taxVatNumber crn image',
               })
               .populate({
                    path: 'client',
                    select: 'clientId clientType',
                    populate: {
                         path: 'clientId',
                         select: 'name contact',
                    },
               })
               .populate({
                    path: 'worksList sparePartsList',
                    select: 'work quantity finalCost',
                    populate: {
                         path: 'work',
                         select: 'title cost',
                    },
               })
               .populate({
                    path: 'sparePartsList',
                    select: 'item quantity finalCost',
                    populate: {
                         path: 'item',
                         select: 'title cost',
                    },
               })
               .populate({
                    path: 'car',
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi',
                    populate: {
                         path: 'brand plateNumberForSaudi.symbol model',
                         // model: 'CarBrand',
                         // select: 'title image',
                    },
               });
          return populatedResult;
     } catch (error) {
          console.log('🚀 ~ createInvoice ~ error:', error);
          throw error;
     }
};

const getAllInvoices = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IInvoice[] }> => {
     const queryBuilder = new QueryBuilder(
          Invoice.find()
               .populate({
                    path: 'car',
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi providerWorkShopId slugForSaudiCarPlateNumber ',
                    populate: {
                         path: 'brand plateNumberForSaudi.symbol model',
                         select: 'title image',
                    },
               })
               .populate({
                    path: 'payment',
                    select: 'createdAt',
               }),
          query,
     );
     console.log('🚀 ~ getAllInvoices ~ queryBuilder finalized query:', queryBuilder.query);
     const result = await queryBuilder.filter().sort().paginate().fields().search(['description']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedInvoices = async (): Promise<IInvoice[]> => {
     const result = await Invoice.find();
     return result;
};

const updateInvoice = async (id: string, payload: Partial<IInvoice & { extraTimeForUnpaidPostpaidInvoice: number }>): Promise<IInvoice | null> => {
     const isExist = await Invoice.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.**.');
     }

     if (isExist?.paymentMethod === PaymentMethod.POSTPAID && isExist.paymentStatus === PaymentStatus.UNPAID && isExist?.postPaymentDate) {
          if (payload.postPaymentDate && typeof payload.postPaymentDate === 'string') {
               payload.postPaymentDate = new Date(payload.postPaymentDate);
               // check its not in the past
               if (payload.postPaymentDate < new Date() || isExist?.postPaymentDate <= payload.postPaymentDate) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Post Payment Date cannot be in the past or less than the previous post payment date');
               }
          }
          if (!payload.postPaymentDate && payload.extraTimeForUnpaidPostpaidInvoice) {
               payload.postPaymentDate = isExist.postPaymentDate;
               payload.postPaymentDate.setDate(payload.postPaymentDate.getDate() + payload.extraTimeForUnpaidPostpaidInvoice);
          }
     }

     return await Invoice.findByIdAndUpdate(id, payload, { new: true });
};

const deleteInvoice = async (id: string): Promise<IInvoice | null> => {
     const result = await Invoice.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.**');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteInvoice = async (id: string): Promise<IInvoice | null> => {
     const result = await Invoice.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, '*..*');
     }
     return result;
};

const getInvoiceById = async (id: string): Promise<IInvoice | null> => {
     const result = await Invoice.findById(id)
          .populate({
               path: 'client',
               select: 'clientId clientType',
               populate: {
                    path: 'clientId',
                    select: 'name contact _id',
               },
          })
          .populate({
               path: 'worksList sparePartsList',
               select: 'work quantity finalCost',
               populate: {
                    path: 'work',
                    select: 'title cost',
               },
          })
          .populate({
               path: 'sparePartsList',
               select: 'item quantity finalCost',
               populate: {
                    path: 'item',
                    select: 'title cost',
               },
          })
          .populate({
               path: 'car',
               select: 'model brand year plateNumberForInternational plateNumberForSaudi',
               populate: {
                    path: 'brand plateNumberForSaudi.symbol model',
                    // select: 'title image',
               },
          });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*-.**');
     }
     return result;
};

const releaseInvoice = async (invoiceId: string, payload: { providerWorkShopId: string; cardApprovalCode: string }) => {
     const result = await Invoice.findById(invoiceId);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.*.');
     }
     if (result.paymentMethod === PaymentMethod.CARD && !payload.cardApprovalCode) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'cardApprovalCode is required for TRANSFER payment method');
     }

     const paymentResult = await paymentService.createPayment({
          providerWorkShopId: new ObjectId(payload.providerWorkShopId),
          invoice: new ObjectId(invoiceId),
          isCashRecieved: result.paymentMethod === PaymentMethod.CASH ? true : null,
          cardApprovalCode: result.paymentMethod === PaymentMethod.CARD ? payload.cardApprovalCode : null,
          isRecievedTransfer: result.paymentMethod === PaymentMethod.TRANSFER ? true : null,
          postPaymentDate: result.paymentMethod === PaymentMethod.POSTPAID ? result.postPaymentDate : null,
     });
     console.log('🚀 ~ releaseInvoice ~ paymentResult:', paymentResult);
     return paymentResult;
};

const resendInvoice = async (invoiceId: string) => {
     const result = await getInvoiceById(invoiceId);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.*.');
     }
     await sendNotifications({
          title: `${(result.client as any).clientId.name}`,
          receiver: (result.client as any).clientId._id,
          message: `Invoice No. ${invoiceId} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
          type: 'ALERT',
     });
     await releaseInvoiceToWhatsApp(result);
     return result;
};

export const invoiceService = {
     createInvoice,
     getAllInvoices,
     getAllUnpaginatedInvoices,
     updateInvoice,
     deleteInvoice,
     hardDeleteInvoice,
     getInvoiceById,
     releaseInvoice,
     resendInvoice,
};
