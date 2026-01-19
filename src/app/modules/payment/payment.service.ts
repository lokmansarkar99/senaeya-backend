import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { S3Helper } from '../../../helpers/aws/s3helper';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import QueryBuilder from '../../builder/QueryBuilder';
import { TranslatedFieldEnum } from '../invoice/invoice.interface';
import { Invoice } from '../invoice/invoice.model';
import { PaymentMethod, PaymentStatus } from './payment.enum';
import { Ipayment } from './payment.interface';
import { Payment } from './payment.model';
import { generatePDF, releaseInvoiceToWhatsApp } from './payment.utils';
import config from '../../../config';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { sendToTopic } from '../pushNotification/pushNotification.service';
import DeviceToken from '../DeviceToken/DeviceToken.model';

const createPayment = async (payload: Partial<Ipayment & { lang: TranslatedFieldEnum; postPaymentDate: Date | string; isCashRecieved: boolean; cardApprovalCode: string }>) => {
     const isExistPayment = await Payment.findOne({ invoice: payload.invoice, providerWorkShopId: payload.providerWorkShopId, paymentStatus: PaymentStatus.PAID });
     if (isExistPayment) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Payment already paid.');
     }
     const invoice = await Invoice.findOne({ _id: payload.invoice, providerWorkShopId: payload.providerWorkShopId, paymentStatus: PaymentStatus.UNPAID });

     if (!invoice) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.');
     }

     if (payload.paymentMethod == PaymentMethod.CASH && !payload.isCashRecieved) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Cash must be recieved.');
     } else if (payload.paymentMethod == PaymentMethod.TRANSFER && !payload.isCashRecieved) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transfer must be done.');
     } else if (payload.paymentMethod == PaymentMethod.CARD && !payload.cardApprovalCode) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Card approval code must be provided.');
     }

     // use mongoose transaction
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const paymentDTO = {
               providerWorkShopId: payload.providerWorkShopId,
               invoice: payload.invoice,
               paymentMethod: payload.paymentMethod,
               paymentStatus: PaymentStatus.PAID,
               cardApprovalCode: payload.cardApprovalCode || undefined,
               amount: invoice.finalCost,
          };
          const [payment] = await Payment.create([paymentDTO], { session });
          if (!payment) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
          }
          const updatedInvoice = await Invoice.findByIdAndUpdate(
               invoice._id,
               { payment: payment._id, paymentStatus: PaymentStatus.PAID, paymentMethod: payload.paymentMethod },
               { new: true, session },
          );
          if (!updatedInvoice) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found**.');
          }

          // // Commit the transaction
          await session.commitTransaction();
          session.endSession();

          // Populate invoice data within transaction to ensure consistency with uncommitted changes
          const populatedResult = await Invoice.findById(updatedInvoice._id)
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
               throw new AppError(StatusCodes.NOT_FOUND, 'Populated invoice data not found.');
          }

          // const createInvoiceTemplate = await whatsAppTemplate.createInvoice(populatedResult as any, payload.lang || TranslatedFieldEnum.en);
          // const invoiceInpdfPath = await generatePDF(createInvoiceTemplate);
          // const fileBuffer = fs.readFileSync(invoiceInpdfPath);
          // const invoiceAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', populatedResult._id.toString(), 'application/pdf');

          // populatedResult.invoiceAwsLink = invoiceAwsLink;
          await populatedResult.save();

          // // send invoiceSheet to client
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

          return payment;
     } catch (error) {
          console.log('🚀 ~ createPayment ~ error:', error);
          // Abort the transaction on error
          await session.abortTransaction();
          session.endSession();

          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Payment not created.');
     }
};

const getAllPayments = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: Ipayment[] }> => {
     const queryBuilder = new QueryBuilder(Payment.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedPayments = async (): Promise<Ipayment[]> => {
     const result = await Payment.find();
     return result;
};

const updatePayment = async (id: string, payload: Partial<Ipayment>): Promise<Ipayment | null> => {
     const isExist = await Payment.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
     }
     return await Payment.findByIdAndUpdate(id, payload, { new: true });
};

const deletePayment = async (id: string): Promise<Ipayment | null> => {
     const result = await Payment.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeletePayment = async (id: string): Promise<Ipayment | null> => {
     const result = await Payment.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
     }
     return result;
};

const getPaymentById = async (id: string): Promise<Ipayment | null> => {
     const result = await Payment.findById(id);
     return result;
};

const updatePaymentStatus = async (...args: any[]) => {};

export const paymentService = {
     createPayment,
     getAllPayments,
     getAllUnpaginatedPayments,
     updatePayment,
     deletePayment,
     hardDeletePayment,
     getPaymentById,
     updatePaymentStatus,
};
