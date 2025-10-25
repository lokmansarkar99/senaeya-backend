import { SparePartType } from './spareParts.enum';
import { Types } from 'mongoose';

export interface ISpareParts {
     title: {
          ar: string;
          bn: string;
          ur: string;
          hi: string;
          tl: string;
          en: string;
     };
     itemName: string;
     providerWorkShopId?: Types.ObjectId | null;
     type: SparePartType.SPARE_PART;
     code: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type ISparePartsFilters = {
     searchTerm?: string;
};
