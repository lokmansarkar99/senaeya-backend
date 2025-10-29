import { Schema, Types, model } from 'mongoose';
import { IInvoice, IInvoiceWork, IInvoiceSpareParts } from './invoice.interface';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { default_discount, default_vat, DiscountType } from './invoice.enum';
import { Client } from '../client/client.model';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Work } from '../work/work.model';
import Settings from '../settings/settings.model';
import { Car } from '../car/car.model';
import { SpareParts } from '../spareParts/spareParts.model';
import { WorkType } from '../work/work.enum';
import { SparePartType } from '../spareParts/spareParts.enum';
import { sparePartsService } from '../spareParts/spareParts.service';
import { ISpareParts } from '../spareParts/spareParts.interface';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';

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
          car: { type: Schema.Types.ObjectId, ref: 'Car', required: false, default: null },
          discount: { type: Number, required: false },
          discountType: { type: String, enum: DiscountType, required: false },
          worksList: { type: [InvoiceWorkSchema], required: true, default: [] },
          sparePartsList: { type: [InvoiceSparePartsSchema], required: false, default: [] },
          totalCostExcludingTax: { type: Number, required: true },
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
     //  * steps ⬇️⬇️
     //  * is client exist and belongs to this workShop ✅
     //  * is all works exists and belongs to this workShop ✅
     //  * is all spareParts exists and belongs to this workShop ✅
     //  * calculate the totalCostExcludingTax ✅
     //  * fetch the vat from settings module ✅
     //  * calculate the taxAmount ✅
     //  * calculate the totalCostIncludingTax ✅
     //  * cal the discount amount ✅
     //  * calculate the finalCost ✅
     //  * create invoice with null payment ✅

     let isExistWorks: any[] = [];
     let isExistSpareParts: any[] = [];

     const isExistClient = await Client.findOne({ _id: payload.client, providerWorkShopId: payload.providerWorkShopId });
     if (!isExistClient) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.');
     }

     if (payload.car) {
          const isExistCar = await Car.findOne({ _id: payload.car, providerWorkShopId: payload.providerWorkShopId });
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
     // totalCostExcludingTax
     let totalCostOfWorkShopExcludingTax = 0;
     if (payload.worksList) {
          totalCostOfWorkShopExcludingTax += payload.worksList.reduce((acc, work) => acc + work.finalCost, 0);
     }
     let totalCostOfSparePartsExcludingTax = 0;
     if (payload.sparePartsList) {
          totalCostOfSparePartsExcludingTax += payload.sparePartsList.reduce((acc, sparePart) => acc + sparePart.finalCost, 0);
     }
     let totalCostExcludingTax = totalCostOfWorkShopExcludingTax + totalCostOfSparePartsExcludingTax;

     let vat = default_vat;
     const workShopSettings = await Settings.findOne({ providerWorkShopId: payload.providerWorkShopId }).select('vat');
     if (workShopSettings) {
          vat = workShopSettings.vat as number;
     }

     // taxAmount
     let taxAmountForWorkCost = totalCostOfWorkShopExcludingTax * (vat / 100);

     // totalCostIncludingTax
     let totalCostIncludingTax = totalCostExcludingTax + taxAmountForWorkCost;

     // discount
     let finalDiscountInFlatAmount = default_discount;
     if (payload.discount && payload.discountType) {
          finalDiscountInFlatAmount = payload.discountType === DiscountType.PERCENTAGE ? (totalCostExcludingTax * payload.discount) / 100 : payload.discount;
     }

     // finalCost
     let finalCost = totalCostExcludingTax + taxAmountForWorkCost - finalDiscountInFlatAmount;

     payload.totalCostExcludingTax = totalCostExcludingTax;
     payload.taxAmount = taxAmountForWorkCost;
     payload.totalCostIncludingTax = totalCostIncludingTax;
     payload.finalDiscountInFlatAmount = finalDiscountInFlatAmount;
     payload.taxPercentage = vat;
     payload.finalCost = finalCost;
     payload.totalCostOfWorkShopExcludingTax = totalCostOfWorkShopExcludingTax;
     payload.totalCostOfSparePartsExcludingTax = totalCostOfSparePartsExcludingTax;

     next();
});

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
