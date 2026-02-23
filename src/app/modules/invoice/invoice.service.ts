import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import config from '../../../config';
import AppError from '../../../errors/AppError';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { generateFatooraQR } from '../../../helpers/qrcode/generateFatooraQr';
import { addToBullQueueToCheckInvoicePaymentStatus, sparePartsQueue } from '../../../helpers/redis/queues';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import QueryBuilder from '../../builder/QueryBuilder';
import { AutoIncrementService } from '../AutoIncrement/AutoIncrement.service';
import DeviceToken from '../DeviceToken/DeviceToken.model';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { Payment } from '../payment/payment.model';
import { releaseInvoiceToWhatsApp } from '../payment/payment.utils';
import { sendToTopic } from '../pushNotification/pushNotification.service';
import { WorkShop } from '../workShop/workShop.model';
import { IInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';

const createInvoice = async (payload: Partial<IInvoice & { isReleased: string; isCashRecieved: string; cardApprovalCode: string }>) => {
     const isReleased = payload.isReleased === 'true' || false;
     const isCashRecieved = payload.isCashRecieved === 'true' || false;
     if (payload.paymentMethod !== PaymentMethod.POSTPAID) {
          payload.postPaymentDate = undefined;
          if (payload.paymentMethod == PaymentMethod.CASH) {
               isCashRecieved ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
          } else if (payload.paymentMethod == PaymentMethod.TRANSFER) {
               isCashRecieved ? (payload.paymentStatus = PaymentStatus.PAID) : (payload.paymentStatus = PaymentStatus.UNPAID);
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
                    console.log("🚀 ~ createInvoice ~ 'Post Payment Date cannot be in the past':", 'Post Payment Date cannot be in the past');
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Post Payment Date cannot be in the past');
               }
          }
     }

     const session = await mongoose.startSession();
     session.startTransaction();
     try {
          // In the createInvoice method, replace the spare parts processing code with:
          if (payload?.sparePartsList && payload?.sparePartsList?.length > 0) {
               // Add each spare part to the queue for background processing
               await Promise.all(
                    payload.sparePartsList.map(async (sparePart) => {
                         try {
                              await sparePartsQueue.add(
                                   'processSparePart',
                                   {
                                        sparePart: {
                                             code: sparePart.code,
                                             itemName: sparePart.itemName,
                                             providerWorkShopId: payload.providerWorkShopId,
                                        },
                                   },
                                   {
                                        // Optional: Add job options if needed
                                        attempts: 3,
                                        backoff: {
                                             type: 'exponential',
                                             delay: 2000,
                                        },
                                   },
                              );
                         } catch (error) {
                              console.error('Failed to queue spare part:', error);
                              // Continue with other spare parts even if one fails
                         }
                    }),
               );
          }

          // create a new recieptNumber
          const recieptNumber = await AutoIncrementService.increaseAutoIncrement('invoice', session, payload.providerWorkShopId?.toString());
          payload.recieptNumber = recieptNumber.value;
          // Create invoice within transaction
          const [resultInvoice] = await Invoice.create([payload], { session });

          if (!resultInvoice) {
               console.log("🚀 ~ createInvoice ~ 'Failed to create invoice.':", 'Failed to create invoice.');
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
                    console.log("🚀 ~ createInvoice ~ 'Failed to create payment.':", 'Failed to create payment.');
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
                    path: 'client',
                    populate: {
                         path: 'clientId',
                         select: 'name contact _id',
                    },
               })
               .populate({
                    path: 'worksList',
                    select: 'work quantity finalCost',
                    populate: {
                         path: 'work',
                         select: 'title cost code',
                    },
               })
               .populate({
                    path: 'providerWorkShopId',
                    select: 'image ownerId address workshopNameArabic taxVatNumber crn bankAccountNumber',
                    populate: {
                         path: 'ownerId',
                         select: 'name',
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
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi carType',
                    // populate: {
                    //      path: 'brand plateNumberForSaudi.symbol model',
                    //      // select: 'title image',
                    // },
                    populate: [
                         {
                              path: 'brand model',
                              select: 'title image',
                         },
                         {
                              path: 'plateNumberForSaudi.symbol',
                              select: 'image',
                         },
                    ],
               });

          if (!populatedResult) {
               console.log("🚀 ~ createInvoice ~ 'Populated invoice data not found.':", 'Populated invoice data not found.');
               throw new AppError(StatusCodes.NOT_FOUND, 'Populated invoice data not found.');
          }

          // generate qr code if taxVatNumber is not empty
          if ((populatedResult.providerWorkShopId as any).taxVatNumber) {
               const qrPath = await generateFatooraQR({
                    workshopNameArabic: (populatedResult.providerWorkShopId as any).workshopNameArabic,
                    taxVatNumber: (populatedResult.providerWorkShopId as any).taxVatNumber,
                    createdAt: populatedResult.createdAt.toISOString(),
                    totalCostIncludingTax: populatedResult.totalCostIncludingTax.toString(),
                    taxAmount: populatedResult.taxAmount.toString(), // will be "0" if no taxVatNumber
                    invoiceId: populatedResult._id.toString(),
               });
               populatedResult.invoiceQRLink = qrPath;
               await populatedResult.save(); // persist the QR link
          }

          // Post-commit operations: notifications and WhatsApp release (non-transactional)
          if (isReleased) {
               await sendNotifications({
                    title: `${(populatedResult.client as any)?.clientId?.name || (populatedResult.client as any)?.workShopNameAsClient || 'Unknown Client'}`,
                    receiver: (populatedResult.client as any)?.clientId?._id,
                    message: `Invoice No. ${populatedResult._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                    message_ar: `تم إصدار الفاتورة رقم ${populatedResult._id} وتم إرسال نسخة منها إلى هاتف العميل عبر واتساب`,
                    message_bn: `ইনভয়েস নম্বর ${populatedResult._id} ইস্যু করা হয়েছে এবং একটি কপি হোয়াটসঅ্যাপের মাধ্যমে গ্রাহকের মোবাইল ফোনে পাঠানো হয়েছে`,
                    message_tl: `Ang Invoice No. ${populatedResult._id} ay naibigay na at isang kopya ang ipinadala sa mobile phone ng customer sa pamamagitan ng WhatsApp`,
                    message_hi: `चालान संख्या ${populatedResult._id} जारी कर दी गई है और उसकी एक प्रति व्हाट्सएप के माध्यम से ग्राहक के मोबाइल फोन पर भेज दी गई है`,
                    message_ur: `انوائس نمبر ${populatedResult._id} جاری کر دیا گیا ہے اور اس کی ایک نقل واٹس ایپ کے ذریعے کسٹمر کے موبائل فون پر بھیج دی گئی ہے`,
                    type: 'ALERT',
               });

               if ((populatedResult.client as any)?.clientId?._id) {
                    const existingToken = await DeviceToken.findOne({
                         userId: (populatedResult.client as any)?.clientId?._id,
                    });
                    if (existingToken && existingToken.fcmToken) {
                         await sendToTopic({
                              token: existingToken.fcmToken,
                              title: 'Invoice Issued',
                              body: `Invoice No. ${populatedResult._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                              data: {
                                   title: `${(populatedResult.client as any)?.clientId?.name || (populatedResult.client as any)?.workShopNameAsClient || 'Unknown Client'}`,
                                   receiver: (populatedResult.client as any)?.clientId?._id,
                                   message: `Invoice No. ${populatedResult._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                                   message_ar: `تم إصدار الفاتورة رقم ${populatedResult._id} وتم إرسال نسخة منها إلى هاتف العميل عبر واتساب`,
                                   message_bn: `ইনভয়েস নম্বর ${populatedResult._id} ইস্যু করা হয়েছে এবং একটি কপি হোয়াটসঅ্যাপের মাধ্যমে গ্রাহকের মোবাইল ফোনে পাঠানো হয়েছে`,
                                   message_tl: `Ang Invoice No. ${populatedResult._id} ay naibigay na at isang kopya ang ipinadala sa mobile phone ng customer sa pamamagitan ng WhatsApp`,
                                   message_hi: `चालान संख्या ${populatedResult._id} जारी कर दी गई है और उसकी एक प्रति व्हाट्सएप के माध्यम से ग्राहक के मोबाइल फोन पर भेज दी गई है`,
                                   message_ur: `انوائس نمبر ${populatedResult._id} جاری کر دیا گیا ہے اور اس کی ایک نقل واٹس ایپ کے ذریعے کسٹمر کے موبائل فون پر بھیج دی گئی ہے`,
                                   type: 'ALERT',
                              },
                         });
                    }
               }
               // await releaseInvoiceToWhatsApp(populatedResult);
               const message = whatsAppTemplate.getInvoiceDetails({ url: `${config?.frontend_invoice_url}/${populatedResult._id}` });
               await whatsAppHelper.sendWhatsAppTextMessage({ to: (populatedResult.client as any)?.contact, body: message });
          }

          return populatedResult;
     } catch (error) {
          console.error('Error in createInvoice:', error);
          await session.abortTransaction();
          await session.endSession();
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
                    path: 'client',
                    select: 'clientId clientType workShopNameAsClient contact',
                    populate: {
                         path: 'clientId',
                         select: 'name',
                    },
               })
               .populate({
                    path: 'payment',
                    select: 'createdAt',
               }),
          query,
     );
     const result = await queryBuilder.filter().sort().paginate().fields().search(['description', 'car']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllInvoicesWithProvider = async (query: Record<string, any>, providerWorkShopId: string): Promise<{ meta: { total: number; page: number; limit: number }; result: IInvoice[] }> => {
     const queryBuilder = new QueryBuilder(
          Invoice.find({
               providerWorkShopId: new mongoose.Types.ObjectId(providerWorkShopId)
          })
               .populate({
                    path: 'car',
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi providerWorkShopId slugForSaudiCarPlateNumber ',
                    populate: {
                         path: 'brand plateNumberForSaudi.symbol model',
                         select: 'title image',
                    },
               })
               .populate({
                    path: 'client',
                    select: 'clientId clientType workShopNameAsClient contact',
                    populate: {
                         path: 'clientId',
                         select: 'name',
                    },
               })
               .populate({
                    path: 'payment',
                    select: 'createdAt',
               }),
          query,
     );
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
                    select: 'name contact _id image createdAt',
               },
          })
          .populate({
               path: 'worksList',
               select: 'work quantity finalCost',
               populate: {
                    path: 'work',
                    select: 'title cost code',
               },
          })
          .populate({
               path: 'providerWorkShopId',
               select: 'image ownerId address workshopNameArabic workshopNameEnglish taxVatNumber crn bankAccountNumber contact',
               populate: {
                    path: 'ownerId',
                    select: 'name',
               },
          })
          .populate({
               path: 'sparePartsList',
               select: 'itemName quantity cost code finalCost',
               // populate: {
               //      path: 'item',
               //      select: 'title cost',
               // },
          })
          .populate({
               path: 'car',
               select: 'model brand year plateNumberForInternational plateNumberForSaudi carType',
               // populate: {
               //      path: 'brand plateNumberForSaudi.symbol model',
               //      // select: 'title image',
               // },
               populate: [
                    {
                         path: 'brand model',
                         select: 'title image',
                    },
                    {
                         path: 'plateNumberForSaudi.symbol',
                         select: 'image',
                    },
               ],
          });

     console.log("result🪷🪷", result);
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
          message_ar: `تم إصدار الفاتورة رقم (${invoiceId}) وإرسال نسخة إلى جوال العميل عبر الواتساب`,
          message_bn: `ইনভয়েস নং (${invoiceId}) জারি করা হয়েছে এবং এর একটি কপি গ্রাহকের মোবাইলে হোয়াটসঅ্যাপের মাধ্যমে পাঠানো হয়েছে।`,
          message_tl: `Nailabas na ang Invoice No. (${invoiceId}) at naipadala na ang kopya nito sa mobile ng customer sa pamamagitan ng WhatsApp.`,
          message_hi: `इनवॉइस संख्या (${invoiceId}) जारी कर दिया गया है और इसकी एक प्रति ग्राहक के मोबाइल पर व्हाट्सएप के माध्यम से भेज दी गई है।`,
          message_ur: `انوائس نمبر (${invoiceId}) جاری کر دیا گیا ہے اور اس کی کاپی واٹس ایپ کے ذریعے صارف کے موبائل پر بھیج دی گئی ہے۔`,
          type: 'ALERT',
     });

     if ((result.client as any).clientId._id) {
          const existingToken = await DeviceToken.findOne({
               userId: (result.client as any).clientId._id,
          });
          if (existingToken && existingToken.fcmToken) {
               await sendToTopic({
                    token: existingToken.fcmToken,
                    title: 'Invoice Issued',
                    body: `Invoice No. ${invoiceId} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                    data: {
                         title: `${(result.client as any).clientId.name}`,
                         receiver: (result.client as any).clientId._id,
                         message: `Invoice No. ${invoiceId} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                         message_ar: `تم إصدار الفاتورة رقم (${invoiceId}) وإرسال نسخة إلى جوال العميل عبر الواتساب`,
                         message_bn: `ইনভয়েস নং (${invoiceId}) জারি করা হয়েছে এবং এর একটি কপি গ্রাহকের মোবাইলে হোয়াটসঅ্যাপের মাধ্যমে পাঠানো হয়েছে।`,
                         message_tl: `Nailabas na ang Invoice No. (${invoiceId}) at naipadala na ang kopya nito sa mobile ng customer sa pamamagitan ng WhatsApp.`,
                         message_hi: `इनवॉइस संख्या (${invoiceId}) जारी कर दिया गया है और इसकी एक प्रति ग्राहक के मोबाइल पर व्हाट्सएप के माध्यम से भेज दी गई है।`,
                         message_ur: `انوائس نمبر (${invoiceId}) جاری کر دیا گیا ہے اور اس کی کاپی واٹس ایپ کے ذریعے صارف کے موبائل پر بھیج دی گئی ہے۔`,
                         type: 'ALERT',
                    },
               });
          }
     }
     await releaseInvoiceToWhatsApp(result);
     return result;
};

export const invoiceService = {
     createInvoice,
     getAllInvoices,
     getAllInvoicesWithProvider,
     getAllUnpaginatedInvoices,
     updateInvoice,
     deleteInvoice,
     hardDeleteInvoice,
     getInvoiceById,
     releaseInvoice,
     resendInvoice,
};
