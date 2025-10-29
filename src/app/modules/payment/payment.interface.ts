import { Types } from "mongoose";
import { PaymentMethod, PaymentStatus } from "./payment.enum";
import { TranslatedFieldEnum } from "../invoice/invoice.interface";

export interface Ipayment {
     providerWorkShopId: Types.ObjectId;
     invoice: Types.ObjectId;
     paymentMethod: PaymentMethod;
     paymentStatus: PaymentStatus;
     amount: number;
     cardApprovalCode?: string | undefined;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IpaymentFilters = {
     searchTerm?: string;
     lang?: TranslatedFieldEnum;
};
