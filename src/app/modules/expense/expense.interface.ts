import { Types } from 'mongoose';

export interface Iexpense {
     providerWorkShopId: Types.ObjectId;
     title: {
          ar: string;
          bn: string;
          ur: string;
          hi: string;
          tl: string;
          en: string;
     };
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
