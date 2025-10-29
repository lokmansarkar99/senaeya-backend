import { Types } from 'mongoose';
import { CLIENT_TYPE, CLIENT_STATUS } from './client.enum';

export interface IClient {
     providerWorkShopId: Types.ObjectId;
     clientType: CLIENT_TYPE;
     clientId?: string;
     workShopNameAsClient?: string;
     contact: string;
     documentNumber?: string | null; // ref: Document
     cars: Types.ObjectId[]; // servicetaken for as client ref: Car
     invoices: Types.ObjectId[]; // service taken for as client ref: Invoice
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
     status?: CLIENT_STATUS;
}

export type IClientFilters = {
     searchTerm?: string;
     status?: CLIENT_STATUS;
     clientType?: CLIENT_TYPE;
     providerWorkShopId?: Types.ObjectId;
     };
