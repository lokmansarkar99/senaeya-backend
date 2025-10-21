import { Types } from 'mongoose';

export interface Iexpense {
     providerWorkShopId: Types.ObjectId;
     title: string;
     amount: number;
     spendingDate: Date;
     description?: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IexpenseFilters = {
     searchTerm?: string;
};
