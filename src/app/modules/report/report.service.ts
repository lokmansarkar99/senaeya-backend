import { Types } from 'mongoose';
import { Invoice } from '../invoice/invoice.model';
import { Expense } from '../expense/expense.model';
import { Car } from '../car/car.model';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { generatePDF, releaseInvoiceToWhatsApp } from '../payment/payment.utils';
import { S3Helper } from '../../../helpers/aws/s3helper';
import fs from 'fs';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';

const getAllReportsByCreatedDateRange = async (query: Record<string, any>, providerWorkShopId: string, user: any) => {
     const { startDate, endDate } = query;

     // Normalize date range to be inclusive of the whole end day
     const start = new Date(startDate);
     start.setHours(0, 0, 0, 0);
     const end = new Date(endDate);
     end.setHours(23, 59, 59, 999);

     const providerFilter = providerWorkShopId ? { providerWorkShopId: new Types.ObjectId(providerWorkShopId) } : {};

     // Invoices filtered by createdAt within range
     const invoiceMatchBase: any = {
          createdAt: { $gte: start, $lte: end },
          ...providerFilter,
     };

     // Expenses filtered by spendingDate within range (business date) and optional provider scope
     const expenseMatchBase: any = {
          spendingDate: { $gte: start, $lte: end },
          ...providerFilter,
     };

     // Cars filtered by createdAt within range and optional provider scope
     const carMatchBase: any = {
          createdAt: { $gte: start, $lte: end },
          ...providerFilter,
     };

     const [
          // Counts
          paidInvoicesAgg,
          unpaidPostpaidInvoicesAgg,
          unpaidNonPostpaidInvoicesAgg,

          // Totals
          totalAllIncomeAgg,
          totalCollectedIncomeAgg,
          totalUnpaidPostpaidAmountAgg,

          // Expenses total
          totalExpensesAgg,

          // Cars count
          carsCountAgg,
     ] = await Promise.all([
          // number of paid invoices count
          Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.PAID } }, { $count: 'count' }]),

          // number of unpaid postpaid invoices count
          Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: PaymentMethod.POSTPAID } }, { $count: 'count' }]),

          // number of unpaid and non postpaid invoices count
          Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: { $ne: PaymentMethod.POSTPAID } } }, { $count: 'count' }]),

          // total All income recorded of any paymentstatus (sum of finalCost of all invoices)
          Invoice.aggregate([{ $match: { ...invoiceMatchBase } }, { $group: { _id: null, total: { $sum: '$finalCost' } } }]),

          // total income collected as sum of finalCost of paid invoices
          Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.PAID } }, { $group: { _id: null, total: { $sum: '$finalCost' } } }]),

          // total of unpaid postpaid invoices finalCost
          Invoice.aggregate([
               { $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: PaymentMethod.POSTPAID } },
               { $group: { _id: null, total: { $sum: '$finalCost' } } },
          ]),

          // total of expenses (sum of amount) within spendingDate range
          Expense.aggregate([{ $match: { ...expenseMatchBase } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),

          // number of cars count
          Car.aggregate([{ $match: { ...carMatchBase } }, { $count: 'count' }]),
     ]);

     const numberOfPaidInvoices = paidInvoicesAgg[0]?.count || 0;
     const numberOfUnpaidPostpaidInvoices = unpaidPostpaidInvoicesAgg[0]?.count || 0;
     const numberOfUnpaidNonPostpaidInvoices = unpaidNonPostpaidInvoicesAgg[0]?.count || 0;

     const totalAllIncomeRecorded = totalAllIncomeAgg[0]?.total || 0;
     const totalIncomeCollected = totalCollectedIncomeAgg[0]?.total || 0;
     const totalUnpaidPostpaidFinalCost = totalUnpaidPostpaidAmountAgg[0]?.total || 0;
     const totalExpenses = totalExpensesAgg[0]?.total || 0;

     const collectedFinancialBalance = totalIncomeCollected - totalExpenses;
     const recordedFinancialBalance = totalAllIncomeRecorded - totalExpenses;

     const numberOfCars = carsCountAgg[0]?.count || 0;

     const report = {
          numberOfPaidInvoices,
          numberOfUnpaidPostpaidInvoices,
          numberOfUnpaidNonPostpaidInvoices,
          totalAllIncomeRecorded,
          totalIncomeCollected,
          totalUnpaidPostpaidFinalCost,
          totalExpenses,
          collectedFinancialBalance,
          recordedFinancialBalance,
          numberOfCars,
          range: { start, end },
          scopedByProviderWorkShopId: !!providerWorkShopId,
     };

     const createReportTemplate = whatsAppTemplate.createReport(report);
     const reportInpdfPath = await generatePDF(createReportTemplate);
     const fileBuffer = fs.readFileSync(reportInpdfPath);
     const fileName = `report_${startDate}_to_${endDate}`;
     const reportAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', fileName, 'application/pdf');
     await whatsAppHelper.sendWhatsAppPDFMessage({
          to: user.contact,
          priority: 10,
          referenceId: '',
          msgId: '',
          mentions: '',
          filename: `${fileName}_report.pdf`,
          document: reportAwsLink,
          caption: `Report from ${startDate} to ${endDate}`,
     });

     return report;
};

export const reportService = {
     getAllReportsByCreatedDateRange,
};
