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
     customerInvoiceName?: string;
     discount?: number;
     discountType?: DiscountType;
     worksList?: IInvoiceWork[];
     sparePartsList?: IInvoiceSpareParts[];
     paymentMethod: PaymentMethod | undefined;
     paymentStatus: PaymentStatus;
     postPaymentDate?: Date | null;
     payment?: Types.ObjectId | null;
     totalCostExcludingTax?: number;
     taxAmount: number;
     totalCostIncludingTax: number;
     taxPercentage: number;
     finalDiscountInFlatAmount: number;
     finalCost: number;
     totalCostOfSparePartsExcludingTax: number;
     totalCostOfWorkShopExcludingTax: number;
     car?: Types.ObjectId | null;
     invoiceAwsLink?: string;
     invoiceQRLink?: string | '';
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
     recieptNumber: number;
     image: string
}

export type IInvoiceFilters = {
     searchTerm?: string;
};
