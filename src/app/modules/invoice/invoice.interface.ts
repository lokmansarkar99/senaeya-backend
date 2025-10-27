import { Types } from 'mongoose';
import { DiscountType } from './invoice.enum';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';

export interface IInvoiceWork {
     work: Types.ObjectId;
     quantity: number;
     cost: number;
     finalCost: number; // work.cost * quantity
}

export interface IInvoiceSpareParts {
     itemName: string;
     quantity: number;
     cost: number;
     code: string;
     finalCost: number; // item.cost * quantity
}


export enum TranslatedFieldEnum {
     en,
     ar,
     ur,
     hi,
     bn,
     tl,
}

export interface IInvoice {
     _id?: Types.ObjectId;
     providerWorkShopId: Types.ObjectId;
     client: Types.ObjectId;
     discount?: number;
     discountType?: DiscountType;
     worksList?: IInvoiceWork[]; // work.type === 'service'
     sparePartsList?: IInvoiceSpareParts[]; // work.type === 'spare parts'
     paymentMethod?: PaymentMethod | null;
     paymentStatus: PaymentStatus;
     postPaymentDate?: Date | null; // only if the paymentMethod is postpaid
     payment?: Types.ObjectId | null;
     totalCostExcludingTax: number; // based on the total cost(((worksList.reduce((total, work) => total + work.finalCost, 0)) + discount)+sparePartsList.reduce((total, work) => total + work.finalCost, 0))
     taxAmount: number; // based on the totalCostExcludingTax * taxPercentage
     totalCostIncludingTax: number; // based on the totalCostExcludingTax + taxAmount
     taxPercentage: number; // get from website settings
     finalDiscountInFlatAmount: number; // based on the totalCostExcludingTax + taxAmount - discount
     finalCost: number; // based on the totalCostExcludingTax + taxAmount - discount
     totalCostOfWorkShopExcludingTax: number;
     totalCostOfSparePartsExcludingTax: number;
     car?: Types.ObjectId | null;
     invoiceAwsLink?: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IInvoiceFilters = {
     searchTerm?: string;
};
