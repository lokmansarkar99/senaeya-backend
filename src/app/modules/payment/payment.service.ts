import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Ipayment } from './payment.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { Invoice } from '../invoice/invoice.model';
import { PaymentMethod } from './payment.enum';
import { PaymentStatus } from './payment.enum';
import mongoose from 'mongoose';
import { WorkShop } from '../workShop/workShop.model';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { Payment } from './payment.model';
import { generatePDF, releaseInvoiceToWhatsApp } from './payment.utils';
import { S3Helper } from '../../../helpers/aws/s3helper';
import fs from 'fs';;
import { TranslatedFieldEnum } from '../invoice/invoice.interface';
import { sendNotifications} from '../../../helpers/notificationsHelper';

const createPayment = async (payload: Partial<Ipayment & { lang: TranslatedFieldEnum }>) => {
     // /**
     //  * for payment module ⬇️⬇️⬇️⬇️⬇️
     //  * check the paymentMethod
     //  *        if paymentMethod is POSTPAID
     //  *               create the payment
     //  *               update the invoice
     //  *               for saved invoice (with paymentMethod POSTPAID, paymentStatus unpaid)
     //  *               send the invoice to the client whats app
     //  *        if paymentMethod is CASH
     //  *               if cash is recieved true
     //  *                       make a payment
     //  *                       create the invoice
     //  *                       update the invoice by including the payment
     //  *               if cash is recieved false
     //  *                       create the invoice
     //  * convert the postPaymentDate from string to Date for POSTPAID paymentMethod
     //  */

     const isExistPayment = await Payment.findOne({ invoice: payload.invoice, providerWorkShopId: payload.providerWorkShopId });
     if (isExistPayment) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Payment already exists.');
     }
     const invoice = await Invoice.findOne({ _id: payload.invoice, providerWorkShopId: payload.providerWorkShopId });

     if (!invoice) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.');
     }
     const payloadFields = Object.keys(payload);
     if (invoice.paymentMethod === PaymentMethod.CASH) {
          // delete fileds
          delete payload.cardApprovalCode;
          delete payload.isRecievedTransfer;
          delete payload.postPaymentDate;
          if (!payloadFields.includes('isCashRecieved')) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Cash Recieved is required for CASH payment method');
          }
     } else if (invoice.paymentMethod === PaymentMethod.TRANSFER) {
          // delete fileds
          delete payload.isCashRecieved;
          delete payload.cardApprovalCode;
          delete payload.postPaymentDate;
          if (!payloadFields.includes('isRecievedTransfer')) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Recieved Transfer is required for TRANSFER payment method');
          }
     } else if (invoice.paymentMethod === PaymentMethod.CARD) {
          // delete fileds
          delete payload.isCashRecieved;
          delete payload.isRecievedTransfer;
          delete payload.postPaymentDate;
          if (!payload.cardApprovalCode) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Card Approval Code is required for CARD payment method');
          }
     }
     // finalize payload
     payload.amount = invoice.finalCost;
     payload.paymentMethod = invoice.paymentMethod;
     payload.paymentStatus = invoice.paymentStatus;
     if (invoice.paymentMethod === PaymentMethod.POSTPAID) {
          payload.postPaymentDate = invoice.postPaymentDate;
          payload.paymentStatus = PaymentStatus.PAID;
     } else if (invoice.paymentMethod === PaymentMethod.CASH && payload.isCashRecieved) {
          payload.paymentStatus = PaymentStatus.PAID;
     } else if (invoice.paymentMethod === PaymentMethod.TRANSFER && payload.isRecievedTransfer) {
          payload.paymentStatus = PaymentStatus.PAID;
     } else if (invoice.paymentMethod === PaymentMethod.CARD && payload.cardApprovalCode) {
          payload.paymentStatus = PaymentStatus.PAID;
     }

     // use mongoose transaction
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const [payment] = await Payment.create([payload], { session });
          if (!payment) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
          }
          const updatedInvoice = await Invoice.findByIdAndUpdate(invoice._id, { paymentStatus: payment.paymentStatus, payment: payment._id }, { new: true, session })
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
                    path: 'car',
                    select: 'model brand year plateNumberForInternational plateNumberForSaudi',
                    populate: {
                         path: 'brand plateNumberForSaudi.symbol',
                         // model: 'CarBrand',
                         // select: 'title image',
                    },
               });
          if (!updatedInvoice) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found**.');
          }

          const updatedProviderWorkshop = await WorkShop.findByIdAndUpdate(
               invoice.providerWorkShopId,
               {
                    $inc: { generatedInvoiceCount: 1 }, // Correct usage of $inc operator
               },
               { new: true, session },
          );
          if (!updatedProviderWorkshop) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Provider Workshop not found.');
          }

          // // Commit the transaction
          await session.commitTransaction();
          session.endSession();

          const createInvoiceTemplate = await whatsAppTemplate.createInvoice(updatedInvoice, payload.lang || TranslatedFieldEnum.en);
          const invoiceInpdfPath = await generatePDF(createInvoiceTemplate);
          const fileBuffer = fs.readFileSync(invoiceInpdfPath);
          const invoiceAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', updatedInvoice._id.toString(), 'application/pdf');

          updatedInvoice.invoiceAwsLink = invoiceAwsLink;
          await updatedInvoice.save();

          // // send invoiceSheet to client
          if (payment.paymentStatus === PaymentStatus.PAID) {
               await sendNotifications({
                    title: `${(updatedInvoice.client as any).clientId.name}`,
                    receiver: (updatedInvoice.client as any).clientId._id,
                    message: `Invoice No. ${updatedInvoice._id} has been issued and a copy has been sent to the customer’s mobile phone via WhatsApp`,
                    type: 'ALERT',
               });
               await releaseInvoiceToWhatsApp(updatedInvoice);
          }

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

const updatePaymentStatus = async (...args: any[])=> {};

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
