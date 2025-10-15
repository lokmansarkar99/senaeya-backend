import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { paymentService } from '../payment/payment.service';
import { ObjectId } from 'mongodb';
import { releaseInvoiceToWhatsApp } from '../payment/payment.utils';

const createInvoice = async (payload: IInvoice) => {
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
     const invoice = new Invoice(payload);
     // Validate the order data
     await invoice.validate();
     const result = await invoice.save();
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.**..');
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
               path: 'car',
               select: 'model brand year plateNumberForInternational plateNumberForSaudi',
               populate: {
                    path: 'brand plateNumberForSaudi.symbol',
                    // model: 'CarBrand',
                    // select: 'title image',
               },
          });
     return populatedResult;
};

const getAllInvoices = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IInvoice[] }> => {
     const queryBuilder = new QueryBuilder(Invoice.find(), query);
     console.log('🚀 ~ getAllInvoices ~ queryBuilder finalized query:', queryBuilder.query);
     const result = await queryBuilder.filter().sort().paginate().fields().search(['description']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedInvoices = async (): Promise<IInvoice[]> => {
     const result = await Invoice.find();
     return result;
};

const updateInvoice = async (id: string, payload: Partial<IInvoice>): Promise<IInvoice | null> => {
     const isExist = await Invoice.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not found*.**.');
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
     if (result.paymentMethod === PaymentMethod.TRANSFER && !payload.cardApprovalCode) {
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
