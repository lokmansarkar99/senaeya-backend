// import { Types } from 'mongoose';
// import { Invoice } from '../invoice/invoice.model';
// import { Expense } from '../expense/expense.model';
// import { Car } from '../car/car.model';
// import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
// import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
// import { generatePDF, releaseInvoiceToWhatsApp } from '../payment/payment.utils';
// import { S3Helper } from '../../../helpers/aws/s3helper';
// import fs from 'fs';
// import { whatsAppHelper } from '../../../helpers/whatsAppHelper';

// const getAllReportsByCreatedDateRange = async (query: Record<string, any>, providerWorkShopId: string, user: any) => {
//      const { startDate, endDate } = query;

//      // Normalize date range to be inclusive of the whole end day
//      const start = new Date(startDate);
//      start.setHours(0, 0, 0, 0);
//      const end = new Date(endDate);
//      end.setHours(23, 59, 59, 999);

//      const providerFilter = providerWorkShopId ? { providerWorkShopId: new Types.ObjectId(providerWorkShopId) } : {};

//      // Invoices filtered by createdAt within range
//      const invoiceMatchBase: any = {
//           createdAt: { $gte: start, $lte: end },
//           ...providerFilter,
//      };

//      // Expenses filtered by spendingDate within range (business date) and optional provider scope
//      const expenseMatchBase: any = {
//           spendingDate: { $gte: start, $lte: end },
//           ...providerFilter,
//      };

//      // Cars filtered by createdAt within range and optional provider scope
//      const carMatchBase: any = {
//           createdAt: { $gte: start, $lte: end },
//           ...providerFilter,
//      };

//      const [
//           // Counts
//           paidInvoicesAgg,
//           unpaidPostpaidInvoicesAgg,
//           unpaidNonPostpaidInvoicesAgg,

//           // Totals
//           totalAllIncomeAgg,
//           totalCollectedIncomeAgg,
//           totalUnpaidPostpaidAmountAgg,

//           // Expenses total
//           totalExpensesAgg,

//           // Cars count
//           carsCountAgg,
//      ] = await Promise.all([
//           // number of paid invoices count
//           Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.PAID } }, { $count: 'count' }]),

//           // number of unpaid postpaid invoices count
//           Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: PaymentMethod.POSTPAID } }, { $count: 'count' }]),

//           // number of unpaid and non postpaid invoices count
//           Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: { $ne: PaymentMethod.POSTPAID } } }, { $count: 'count' }]),

//           // total All income recorded of any paymentstatus (sum of finalCost of all invoices)
//           Invoice.aggregate([{ $match: { ...invoiceMatchBase } }, { $group: { _id: null, total: { $sum: '$finalCost' } } }]),

//           // total income collected as sum of finalCost of paid invoices
//           Invoice.aggregate([{ $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.PAID } }, { $group: { _id: null, total: { $sum: '$finalCost' } } }]),

//           // total of unpaid postpaid invoices finalCost
//           Invoice.aggregate([
//                { $match: { ...invoiceMatchBase, paymentStatus: PaymentStatus.UNPAID, paymentMethod: PaymentMethod.POSTPAID } },
//                { $group: { _id: null, total: { $sum: '$finalCost' } } },
//           ]),

//           // total of expenses (sum of amount) within spendingDate range
//           Expense.aggregate([{ $match: { ...expenseMatchBase } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),

//           // number of cars count
//           Car.aggregate([{ $match: { ...carMatchBase } }, { $count: 'count' }]),
//      ]);

//      const numberOfPaidInvoices = paidInvoicesAgg[0]?.count || 0;
//      const numberOfUnpaidPostpaidInvoices = unpaidPostpaidInvoicesAgg[0]?.count || 0;
//      const numberOfUnpaidNonPostpaidInvoices = unpaidNonPostpaidInvoicesAgg[0]?.count || 0;

//      const totalAllIncomeRecorded = totalAllIncomeAgg[0]?.total || 0;
//      const totalIncomeCollected = totalCollectedIncomeAgg[0]?.total || 0;
//      const totalUnpaidPostpaidFinalCost = totalUnpaidPostpaidAmountAgg[0]?.total || 0;
//      const totalExpenses = totalExpensesAgg[0]?.total || 0;

//      const collectedFinancialBalance = totalIncomeCollected - totalExpenses;
//      const recordedFinancialBalance = totalAllIncomeRecorded - totalExpenses;

//      const numberOfCars = carsCountAgg[0]?.count || 0;

//      const report = {
//           numberOfPaidInvoices,
//           numberOfUnpaidPostpaidInvoices,
//           numberOfUnpaidNonPostpaidInvoices,
//           totalAllIncomeRecorded,
//           totalIncomeCollected,
//           totalUnpaidPostpaidFinalCost,
//           totalExpenses,
//           collectedFinancialBalance,
//           recordedFinancialBalance,
//           numberOfCars,
//           range: { start, end },
//           scopedByProviderWorkShopId: !!providerWorkShopId,
//      };

//      const createReportTemplate = whatsAppTemplate.createReport(report);
//      const reportInpdfPath = await generatePDF(createReportTemplate);
//      const fileBuffer = fs.readFileSync(reportInpdfPath);
//      const fileName = `report_${startDate}_to_${endDate}`;
//      const reportAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', fileName, 'application/pdf');
//      await whatsAppHelper.sendWhatsAppPDFMessage({
//           to: user.contact,
//           priority: 10,
//           referenceId: '',
//           msgId: '',
//           mentions: '',
//           filename: `${fileName}_report.pdf`,
//           document: reportAwsLink,
//           caption: `Report from ${startDate} to ${endDate}`,
//      });

//      return report;
// };

// export const reportService = {
//      getAllReportsByCreatedDateRange,
// };

/* **************new ***************** */

import { Types } from 'mongoose';
import config from '../../../config';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { Car } from '../car/car.model';
import { Expense } from '../expense/expense.model';
import { Invoice } from '../invoice/invoice.model';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { IworkShop } from '../workShop/workShop.interface';
import { WorkShop } from '../workShop/workShop.model';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { shortUrlService } from '../shortUrl/shortUrl.service';

const getAllReportsByCreatedDateRange = async (query: Record<string, any>, providerWorkShopId: string, user: any, access_token: string) => {
     let { startDate, endDate, income, outlay, noOfCars, lang, isReleased = 'true' } = query;
     income == 'false' ? (income = false) : (income = true);
     outlay == 'false' ? (outlay = false) : (outlay = true);
     noOfCars == 'false' ? (noOfCars = false) : (noOfCars = true);
     isReleased == 'true' ? (isReleased = true) : (isReleased = false);

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

          // Cars count (distinct cars from invoices)
          carsCountAgg,
          workshop,
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

          // number of unique cars on invoices within range
          Invoice.aggregate([{ $match: { ...invoiceMatchBase, car: { $ne: null } } }, { $group: { _id: '$car' } }, { $count: 'count' }]),

          // workshop name
          WorkShop.findById(providerWorkShopId).populate('ownerId', 'contact'),
     ]);

     if (!workshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Workshop not found');
     }

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

     let report: {
          numberOfPaidInvoices: number;
          numberOfUnpaidPostpaidInvoices: number;
          numberOfUnpaidNonPostpaidInvoices: number;
          totalAllIncomeRecorded: number;
          totalIncomeCollected: number;
          totalUnpaidPostpaidFinalCost: number;
          totalExpenses: number;
          collectedFinancialBalance: number | undefined;
          recordedFinancialBalance: number | undefined;
          numberOfCars: number;
          range: { start: Date; end: Date };
          scopedByProviderWorkShopId: boolean;
          workshop: IworkShop;
     } = {
          numberOfPaidInvoices,
          numberOfUnpaidPostpaidInvoices,
          numberOfUnpaidNonPostpaidInvoices,
          totalAllIncomeRecorded: income ? totalAllIncomeRecorded : undefined,
          totalIncomeCollected: income ? totalIncomeCollected : undefined,
          totalUnpaidPostpaidFinalCost: income ? totalUnpaidPostpaidFinalCost : undefined,
          totalExpenses: outlay ? totalExpenses : undefined,
          collectedFinancialBalance: income ? collectedFinancialBalance : undefined,
          recordedFinancialBalance: income ? recordedFinancialBalance : undefined,
          numberOfCars: noOfCars ? numberOfCars : undefined,
          range: { start, end },
          scopedByProviderWorkShopId: !!providerWorkShopId,
          workshop: workshop!,
     };

     if (isReleased) {
          // create a short url with the report url
          const result = await shortUrlService.createShortUrl({
               shortUrl: `${config.frontend_report_url}?startDate=${query.startDate}&endDate=${query.endDate}&income=${query.income || false}&outlay=${query.outlay || false}&noOfCars=${query.noOfCars || false}&isReleased=false&providerWorkShopId=${providerWorkShopId}&lang=${lang || 'en'}&access_token=${access_token}`,
          });
          const message = whatsAppTemplate.getReportDetails({
               url: `${config.backend_url}/shortUrl/${result._id}`,
          });
          // const message = whatsAppTemplate.getReportDetails({
          //      url: `${config.frontend_report_url}?startDate=${query.startDate}&endDate=${query.endDate}&income=${query.income || false}&outlay=${query.outlay || false}&noOfCars=${query.noOfCars || false}&isReleased=false&providerWorkShopId=${providerWorkShopId}&lang=${lang || 'en'}&access_token=${access_token}`,
          // });

          await whatsAppHelper.sendWhatsAppTextMessage({ to: workshop.contact, body: message });

          await sendNotifications({
               title: `${user.name}`,
               receiver: user.id,
               message: `The report was issued and sent to the workshop manager's mobile phone via WhatsApp.`,
               type: 'ALERT',
          });
     }

     return report;
};

/**
 * Get comprehensive dashboard statistics including workshops, cars, and growth metrics
 */

const getDashboardReport = async () => {
     const [
          // Basic counts
          totalWorkshops,
          activeWorkshops,
          totalCars,
          // Monthly growth data with current month's data
          workshopsByMonth,
          carsByMonth,
          // Additional metrics
          workshopsByStatus,
          carsByType,
          recentRegistrations,
     ] = await Promise.all([
          // Total workshops
          WorkShop.countDocuments(),
          // Active workshops (assuming there's an 'isActive' field or similar)
          WorkShop.countDocuments({ status: 'active' }),
          // Total cars
          Car.countDocuments(),
          // Workshops by month for the current year
          WorkShop.aggregate([
               {
                    $match: {
                         createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }, // Current year
                    },
               },
               {
                    $group: {
                         _id: { $month: '$createdAt' },
                         count: { $sum: 1 },
                         // Additional metrics per month if needed
                         active: {
                              $sum: {
                                   $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
                              },
                         },
                    },
               },
               { $sort: { _id: 1 } },
          ]),
          // Cars by month for the current year
          Car.aggregate([
               {
                    $match: {
                         createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }, // Current year
                    },
               },
               {
                    $group: {
                         _id: { $month: '$createdAt' },
                         count: { $sum: 1 },
                    },
               },
               { $sort: { _id: 1 } },
          ]),
          // Workshops by status
          WorkShop.aggregate([
               {
                    $group: {
                         _id: '$status',
                         count: { $sum: 1 },
                    },
               },
          ]),
          // Cars by type (if applicable)
          Car.aggregate([
               {
                    $group: {
                         _id: '$type', // Assuming there's a 'type' field
                         count: { $sum: 1 },
                    },
               },
          ]),
          // Recent registrations (last 5)
          WorkShop.find().sort({ createdAt: -1 }).limit(5).select('workshopNameEnglish workshopNameArabic createdAt status').lean(),
     ]);

     // Calculate growth rates
     const calculateGrowthRate = (data: any[]) => {
          if (data.length < 2) return 0;

          // Sort by month to ensure correct order
          const sortedData = [...data].sort((a, b) => a._id - b._id);
          const currentMonth = sortedData[sortedData.length - 1].count;
          const previousMonth = sortedData[sortedData.length - 2]?.count || 0;

          if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
          return ((currentMonth - previousMonth) / previousMonth) * 100;
     };

     return {
          // Summary
          summary: {
               totalWorkshops,
               activeWorkshops,
               inactiveWorkshops: totalWorkshops - activeWorkshops,
               totalCars,
               workshopGrowthRate: calculateGrowthRate(workshopsByMonth).toFixed(2) + '%',
               carGrowthRate: calculateGrowthRate(carsByMonth).toFixed(2) + '%',
               lastUpdated: new Date(),
          },
          // Monthly trends
          monthlyTrends: {
               workshops: workshopsByMonth.map((item) => ({
                    month: new Date(0, item._id - 1).toLocaleString('default', { month: 'short' }),
                    total: item.count,
                    active: item.active || 0,
               })),
               cars: carsByMonth.map((item) => ({
                    month: new Date(0, item._id - 1).toLocaleString('default', { month: 'short' }),
                    count: item.count,
               })),
          },
          // Distribution
          distribution: {
               workshopsByStatus: workshopsByStatus.reduce(
                    (acc: any, item: any) => ({
                         ...acc,
                         [item._id]: item.count,
                    }),
                    {},
               ),
               carsByType: carsByType.reduce(
                    (acc: any, item: any) => ({
                         ...acc,
                         [item._id]: item.count,
                    }),
                    {},
               ),
          },
          // Recent activity
          recentRegistrations: recentRegistrations.map((workshop: any) => ({
               name: workshop.workshopNameEnglish || workshop.workshopNameArabic,
               date: workshop.createdAt,
               status: workshop.status,
          })),
     };
};

export const reportService = {
     getAllReportsByCreatedDateRange,
     getDashboardReport,
};
