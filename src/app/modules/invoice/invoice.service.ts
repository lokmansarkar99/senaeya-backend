import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IInvoice, TranslatedFieldEnum } from './invoice.interface';
import { Invoice } from './invoice.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { paymentService } from '../payment/payment.service';
import { ObjectId } from 'mongodb';
import { generatePDF, releaseInvoiceToWhatsApp } from '../payment/payment.utils';
import { WorkShop } from '../workShop/workShop.model';
import { MAX_FREE_INVOICE_COUNT } from '../workShop/workshop.enum';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { sparePartsService } from '../spareParts/spareParts.service';
import { SpareParts } from '../spareParts/spareParts.model';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';
import mongoose from 'mongoose';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { S3Helper } from '../../../helpers/aws/s3helper';
import fs from 'fs';
import { addToBullQueueToCheckInvoicePaymentStatus } from '../../../helpers/redis/queues';
import { Payment } from '../payment/payment.model';

// const createInvoice = async (payload: Partial<IInvoice & { isReleased: string; isCashRecieved: boolean; isRecievedTransfer: boolean; cardApprovalCode: string }>) => {
//      const isReleased = payload.isReleased === 'true';
//      if (payload.paymentMethod !== PaymentMethod.POSTPAID) {
//           payload.postPaymentDate = undefined;
//           if (payload.paymentMethod == PaymentMethod.CASH) {
//                payload.isCashRecieved == true ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
//           } else if (payload.paymentMethod == PaymentMethod.TRANSFER) {
//                payload.isRecievedTransfer == true ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
//           } else if (payload.paymentMethod == PaymentMethod.CARD) {
//                payload.cardApprovalCode ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
//           }
//      } else {
//           payload.paymentStatus = PaymentStatus.UNPAID;
//           // convert payload.postPaymentDate string to Date
//           if (payload.postPaymentDate && typeof payload.postPaymentDate === 'string') {
//                payload.postPaymentDate = new Date(payload.postPaymentDate);
//                // check its not in the past
//                if (payload.postPaymentDate < new Date()) {
//                     throw new AppError(StatusCodes.BAD_REQUEST, 'Post Payment Date cannot be in the past');
//                }
//           }
//      }

//      const session = await mongoose.startSession();
//      session.startTransaction();
//      try {
//           console.log("payload.sparePartsList && payload.sparePartsList.length > 0", payload?.sparePartsList, payload?.sparePartsList?.length)
//           // Pre-process spare parts: check existence and create missing ones in parallel
//           if (payload?.sparePartsList && payload?.sparePartsList?.length > 0) {
//                // Collect unique codes with itemNames for batch existence check if possible, but since itemName must match,
//                // parallel individual checks are efficient and simple
//                await Promise.all(
//                     payload.sparePartsList.map(async (sparePart) => {
//                          try {
//                               // Check if spare part with this code and itemName already exists
//                               const existingSparePart = await SpareParts.findOne(
//                                    {
//                                         code: sparePart.code.toLowerCase(),
//                                         itemName: sparePart.itemName,
//                                    },
//                                    { session },
//                               );

//                               if (!existingSparePart) {
//                                    const title = await buildTranslatedField(sparePart.itemName);
//                                    const sparePartData = {
//                                         providerWorkShopId: payload.providerWorkShopId,
//                                         item: sparePart.itemName,
//                                         code: sparePart.code.toLowerCase(),
//                                         title,
//                                    };

//                                    const [newSparePart] = await SpareParts.create([sparePartData], { session });

//                                    if (!newSparePart) {
//                                         // Use a more appropriate error; this should rarely happen if create succeeds
//                                         throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create spare part.');
//                                    }
//                                    console.log("🚀 ~ createInvoice ~ newSparePart created:",)
//                               }
//                          } catch (error) {
//                               console.error('Error processing spare part:', error);
//                               // Continue with other spare parts; transaction will proceed but may have partial data
//                          }
//                     }),
//                );
//           }

//           // Create invoice within transaction
//           const [resultInvoice] = await Invoice.create([payload], { session });

//           if (!resultInvoice) {
//                throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create invoice.');
//           }

//           // Handle payment if invoice is paid
//           if (resultInvoice.paymentStatus === PaymentStatus.PAID) {
//                const paymentPayload = {
//                     providerWorkShopId: payload.providerWorkShopId,
//                     invoice: resultInvoice._id,
//                     paymentMethod: resultInvoice.paymentMethod,
//                     paymentStatus: resultInvoice.paymentStatus,
//                     cardApprovalCode: payload.paymentMethod === PaymentMethod.CARD ? payload.cardApprovalCode : undefined,
//                     amount: resultInvoice.finalCost,
//                };

//                const [payment] = await Payment.create([paymentPayload], { session });
//                if (!payment) {
//                     throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create payment.');
//                }

//                // Update invoice with payment reference
//                resultInvoice.payment = payment._id;
//                await resultInvoice.save({ session });
//           }

//           // Update workshop invoice count if not subscribed (within transaction for atomicity)
//           const workshop = await WorkShop.findById(resultInvoice.providerWorkShopId).select('subscribedPackage generatedInvoiceCount subscriptionId').populate('subscriptionId').session(session);

//           if (workshop && !workshop.subscribedPackage) {
//                workshop.generatedInvoiceCount += 1;
//                await workshop.save({ session });
//           }

//           // Commit transaction
//           await session.commitTransaction();
//           await session.endSession();

//           // Populate invoice data within transaction to ensure consistency with uncommitted changes
//           const populatedResult = await Invoice.findById(resultInvoice._id)
//                .populate({
//                     path: 'providerWorkShopId',
//                     select: 'workshopNameEnglish workshopNameArabic bankAccountNumber taxVatNumber crn image',
//                })
//                .populate({
//                     path: 'client',
//                     populate: {
//                          path: 'clientId',
//                          select: 'name contact',
//                     },
//                })
//                .populate({
//                     path: 'worksList sparePartsList',
//                     select: 'work quantity finalCost',
//                     populate: {
//                          path: 'work',
//                          select: 'title cost',
//                     },
//                })
//                .populate({
//                     path: 'car',
//                     select: 'model brand year plateNumberForInternational plateNumberForSaudi',
//                     populate: {
//                          path: 'brand plateNumberForSaudi.symbol',
//                     },
//                });

//           if (!populatedResult) {
//                throw new AppError(StatusCodes.NOT_FOUND, 'Populated invoice data not found.');
//           }

//           // Generate PDF and upload to S3 (non-DB operations; can be parallelized if needed)
//           const createInvoiceTemplate = await whatsAppTemplate.createInvoice(populatedResult, TranslatedFieldEnum.en);
//           const invoiceInpdfPath = await generatePDF(createInvoiceTemplate);
//           const fileBuffer = fs.readFileSync(invoiceInpdfPath);
//           const invoiceAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', populatedResult._id.toString(), 'application/pdf');

//           // Update invoice with AWS link within transaction
//           populatedResult.invoiceAwsLink = invoiceAwsLink;
//           await populatedResult.save();
//           // Post-commit operations: notifications and WhatsApp release (non-transactional)
//           if (isReleased) {
//                await sendNotifications({
//                     title: `${(populatedResult.client as any).clientId.name}`,
//                     receiver: (populatedResult.client as any).clientId._id,
//                     message: `Invoice No. ${populatedResult._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
//                     type: 'ALERT',
//                });
//                await releaseInvoiceToWhatsApp(populatedResult);
//           }

//           return populatedResult;
//      } catch (error) {
//           await session.abortTransaction();
//           await session.endSession();
//           console.error('Error in createInvoice:', error);
//           throw error;
//      }
// };

const createInvoice = async (payload: Partial<IInvoice & { isReleased: string; isCashRecieved: boolean; isRecievedTransfer: boolean; cardApprovalCode: string }>) => {
     const isReleased = payload.isReleased === 'true';
     if (payload.paymentMethod !== PaymentMethod.POSTPAID) {
          payload.postPaymentDate = undefined;
          if (payload.paymentMethod == PaymentMethod.CASH) {
               payload.isCashRecieved == true ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
          } else if (payload.paymentMethod == PaymentMethod.TRANSFER) {
               payload.isRecievedTransfer == true ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
          } else if (payload.paymentMethod == PaymentMethod.CARD) {
               payload.cardApprovalCode ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
          }
     } else {
          payload.paymentStatus = PaymentStatus.UNPAID;
          // convert payload.postPaymentDate string to Date
          if (payload.postPaymentDate && typeof payload.postPaymentDate === 'string') {
               payload.postPaymentDate = new Date(payload.postPaymentDate);
               // check its not in the past
               if (payload.postPaymentDate < new Date()) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Post Payment Date cannot be in the past');
               }
          }
     }

     const session = await mongoose.startSession();
     session.startTransaction();
     try {
          console.log('payload.sparePartsList && payload.sparePartsList.length > 0', payload?.sparePartsList, payload?.sparePartsList?.length);
          // Pre-process spare parts: check existence and create missing ones in parallel
          if (payload?.sparePartsList && payload?.sparePartsList?.length > 0) {
               // Collect unique codes with itemNames for batch existence check if possible, but since itemName must match,
               // parallel individual checks are efficient and simple
               await Promise.all(
                    payload.sparePartsList.map(async (sparePart) => {
                         try {
                              // Check if spare part with this code and item already exists
                              // Note: Using 'item' to match schema field; assuming 'itemName' in payload maps to 'item' in DB
                              const existingSparePart = await SpareParts.findOne(
                                   {
                                        code: sparePart.code.toLowerCase(),
                                        itemName: sparePart.itemName,
                                   },
                                   null, // Explicit null projection to avoid misinterpreting options as projection
                                   { session },
                              );

                              if (!existingSparePart) {
                                   const title = await buildTranslatedField(sparePart.itemName);
                                   const sparePartData = {
                                        providerWorkShopId: payload.providerWorkShopId,
                                        itemName: sparePart.itemName,
                                        code: sparePart.code.toLowerCase(),
                                        title,
                                   };

                                   const [newSparePart] = await SpareParts.create([sparePartData], { session });

                                   if (!newSparePart) {
                                        // Use a more appropriate error; this should rarely happen if create succeeds
                                        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create spare part.');
                                   }
                                   console.log('🚀 ~ createInvoice ~ newSparePart created:', newSparePart._id);
                              }
                         } catch (error) {
                              console.error('Error processing spare part:', error);
                              // Continue with other spare parts; transaction will proceed but may have partial data
                         }
                    }),
               );
          }

          // Create invoice within transaction
          const [resultInvoice] = await Invoice.create([payload], { session });

          if (!resultInvoice) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create invoice.');
          }

          // Handle payment if invoice is paid
          if (resultInvoice.paymentStatus === PaymentStatus.PAID) {
               const paymentPayload = {
                    providerWorkShopId: payload.providerWorkShopId,
                    invoice: resultInvoice._id,
                    paymentMethod: resultInvoice.paymentMethod,
                    paymentStatus: resultInvoice.paymentStatus,
                    cardApprovalCode: payload.paymentMethod === PaymentMethod.CARD ? payload.cardApprovalCode : undefined,
                    amount: resultInvoice.finalCost,
               };

               const [payment] = await Payment.create([paymentPayload], { session });
               if (!payment) {
                    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create payment.');
               }

               // Update invoice with payment reference
               resultInvoice.payment = payment._id;
               await resultInvoice.save({ session });
          }

          // Update workshop invoice count if not subscribed (within transaction for atomicity)
          const workshop = await WorkShop.findById(resultInvoice.providerWorkShopId).select('subscribedPackage generatedInvoiceCount subscriptionId').populate('subscriptionId').session(session);

          if (workshop && !workshop.subscribedPackage) {
               workshop.generatedInvoiceCount += 1;
               await workshop.save({ session });
          }

          // Commit transaction
          await session.commitTransaction();
          await session.endSession();

          // Populate invoice data after commit (no session needed)
          const populatedResult = await Invoice.findById(resultInvoice._id)
               .populate({
                    path: 'providerWorkShopId',
                    select: 'workshopNameEnglish workshopNameArabic bankAccountNumber taxVatNumber crn image',
               })
               .populate({
                    path: 'client',
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
                    path: 'car',
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi',
                    populate: {
                         path: 'brand plateNumberForSaudi.symbol',
                    },
               });

          if (!populatedResult) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Populated invoice data not found.');
          }

          // Generate PDF and upload to S3 (non-DB operations; can be parallelized if needed)
          const createInvoiceTemplate = await whatsAppTemplate.createInvoice(populatedResult, TranslatedFieldEnum.en);
          const invoiceInpdfPath = await generatePDF(createInvoiceTemplate);
          const fileBuffer = fs.readFileSync(invoiceInpdfPath);
          const invoiceAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', populatedResult._id.toString(), 'application/pdf');

          // Update invoice with AWS link (after commit, no session)
          populatedResult.invoiceAwsLink = invoiceAwsLink;
          await populatedResult.save();

          // Post-commit operations: notifications and WhatsApp release (non-transactional)
          if (isReleased) {
               await sendNotifications({
                    title: `${(populatedResult.client as any).clientId.name}`,
                    receiver: (populatedResult.client as any).clientId._id,
                    message: `Invoice No. ${populatedResult._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                    type: 'ALERT',
               });
               await releaseInvoiceToWhatsApp(populatedResult);
          }

          return populatedResult;
     } catch (error) {
          await session.abortTransaction();
          await session.endSession();
          console.error('Error in createInvoice:', error);
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
     const result = await queryBuilder.filter().sort().paginate().fields().search(['description', 'car']).modelQuery;
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
               await addToBullQueueToCheckInvoicePaymentStatus(id, isExist.client.toString(), Number(payload.extraTimeForUnpaidPostpaidInvoice));
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

const releaseInvoice = async (invoiceId: string) => {
     const result = await Invoice.findById(invoiceId).populate({
          path: 'client',
          populate: {
               path: 'clientId',
               select: 'name contact _id',
          },
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.*.');
     }
     await releaseInvoiceToWhatsApp(result);

     return result;
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
