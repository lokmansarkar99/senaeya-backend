import { WorkType } from './spareParts.enum';
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
     providerWorkShopId: Types.ObjectId;
     type: WorkType.SPARE_PART;
     code: string;
     cost?: number;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type ISparePartsFilters = {
     searchTerm?: string;
};
