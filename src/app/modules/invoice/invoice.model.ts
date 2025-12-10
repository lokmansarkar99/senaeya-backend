import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { Car } from '../car/car.model';
import { Client } from '../client/client.model';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import Settings from '../settings/settings.model';
import { Work } from '../work/work.model';
import { default_discount, default_vat, DiscountType } from './invoice.enum';
import { IInvoice, IInvoiceSpareParts, IInvoiceWork } from './invoice.interface';

const InvoiceWorkSchema = new Schema<IInvoiceWork>({
     work: { type: Schema.Types.ObjectId, ref: 'Work', required: true },
     quantity: { type: Number, required: true },
     cost: { type: Number, required: true },
     finalCost: { type: Number, required: true },
});

const InvoiceSparePartsSchema = new Schema<IInvoiceSpareParts>({
     // item: { type: String, required: true },
     itemName: { type: String, required: true },
     quantity: { type: Number, required: true },
     cost: { type: Number, required: true },
     code: { type: String, required: true },
     finalCost: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
     {
          providerWorkShopId: { type: Schema.Types.ObjectId, ref: 'WorkShop', required: true },
          client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
          customerInvoiceName: { type: String, required: false },
          car: { type: Schema.Types.ObjectId, ref: 'Car', required: false, default: null },
          discount: { type: Number, required: false },
          discountType: { type: String, enum: DiscountType, required: false },
          invoiceQRLink: { type: String, required: false, default: '' },
          worksList: { type: [InvoiceWorkSchema], required: true, default: [] },
          sparePartsList: { type: [InvoiceSparePartsSchema], required: false, default: [] },
          totalCostExcludingTax: { type: Number, required: false },
          taxPercentage: { type: Number, required: true },
          taxAmount: { type: Number, required: true },
          totalCostIncludingTax: { type: Number, required: true },
          paymentMethod: { type: String, enum: PaymentMethod, required: true },
          paymentStatus: { type: String, enum: PaymentStatus, required: true, default: PaymentStatus.UNPAID },
          postPaymentDate: { type: Date, required: false, default: undefined },
          payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: false, default: null },
          finalDiscountInFlatAmount: { type: Number, required: true },
          finalCost: { type: Number, required: true },
          totalCostOfWorkShopExcludingTax: { type: Number, required: true },
          totalCostOfSparePartsExcludingTax: { type: Number, required: true },
          invoiceAwsLink: { type: String, required: false },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

InvoiceSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

InvoiceSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

InvoiceSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

InvoiceSchema.pre('validate', async function (next) {
     const payload = this;

     let isExistWorks: any[] = [];

     const isExistClient = await Client.findOne({ _id: payload.client }).populate('clientId', 'name');
     if (!isExistClient) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.7');
     }

     payload.customerInvoiceName = payload.customerInvoiceName || (payload.client as any).clientId.name;

     if (payload.car) {
          const isExistCar = await Car.findOne({ _id: payload.car });
          if (!isExistCar) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
          }
     }

     if (payload.worksList) {
          const worksIds = payload.worksList.map((work) => new Types.ObjectId(work.work));
          isExistWorks = await Work.find({ _id: { $in: worksIds } });
          if (!isExistWorks || isExistWorks.length !== payload.worksList.length) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.*');
          }
          payload.worksList.forEach((work) => {
               work.finalCost = Number(work.cost) * Number(work.quantity);
               return work;
          });
     }

     if (payload.sparePartsList) {
          payload.sparePartsList.forEach(async (sparePart) => {
               sparePart.finalCost = Number(sparePart.cost) * Number(sparePart.quantity);
               return sparePart;
          });
     }

     let noTaxOnlyCostOfWorks = 0;
     if (payload.worksList) {
          noTaxOnlyCostOfWorks += payload.worksList.reduce((acc, work) => acc + work.finalCost, 0);
     }
     // discount
     let onlyDiscoutFlatAmount = default_discount;
     const workShopSettings = await Settings.findOne({ providerWorkShopId: payload.providerWorkShopId }).select('workShopDiscount');
     if (workShopSettings && workShopSettings.workShopDiscount) {
          onlyDiscoutFlatAmount = workShopSettings.workShopDiscount as number;
     }
     if (noTaxOnlyCostOfWorks && payload.discount && payload.discountType) {
          onlyDiscoutFlatAmount = payload.discountType === DiscountType.PERCENTAGE ? (noTaxOnlyCostOfWorks * payload.discount) / 100 : payload.discount;
     }

     let noTaxButDiscountAdded_WorkCosts = noTaxOnlyCostOfWorks - onlyDiscoutFlatAmount;
     let vatPercentage = default_vat;
     const appSettings = await Settings.findOne({ providerWorkShopId: undefined }).select('defaultVat');
     if (appSettings && appSettings.defaultVat) {
          vatPercentage = appSettings.defaultVat as number;
     }
     // taxAmount
     let onlyTaxInFlatAmount = noTaxButDiscountAdded_WorkCosts * (vatPercentage / 100);

     let withTaxAndDiscountWorkCosts = noTaxButDiscountAdded_WorkCosts + onlyTaxInFlatAmount;

     let noTaxOnlyPartsCosts = 0;
     if (payload.sparePartsList) {
          noTaxOnlyPartsCosts += payload.sparePartsList.reduce((acc, sparePart) => acc + sparePart.finalCost, 0);
     }

     let withTaxAndDiscoutAndIncludingPartsCosts = withTaxAndDiscountWorkCosts + noTaxOnlyPartsCosts;

     // finalCost
     let finalCost = withTaxAndDiscoutAndIncludingPartsCosts;

     payload.totalCostExcludingTax = noTaxOnlyPartsCosts + noTaxOnlyCostOfWorks;
     payload.taxAmount = onlyTaxInFlatAmount;
     payload.totalCostIncludingTax = withTaxAndDiscountWorkCosts;
     payload.finalDiscountInFlatAmount = onlyDiscoutFlatAmount;
     payload.taxPercentage = vatPercentage;
     payload.finalCost = finalCost;
     payload.totalCostOfWorkShopExcludingTax = noTaxOnlyCostOfWorks;
     payload.totalCostOfSparePartsExcludingTax = noTaxOnlyPartsCosts;

     next();
});

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
