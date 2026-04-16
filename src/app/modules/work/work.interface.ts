import { Types } from 'mongoose';
import { WorkType } from './work.enum';

export interface Iwork {
     title: {
          ar: string;
          bn: string;
          ur: string;
          hi: string;
          tl: string;
          en: string;
     };
     workCategoryName: Types.ObjectId | string | Record<string, unknown>;
     type: WorkType.SERVICE;
     code: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IworkFilters = {
     searchTerm?: string;
};
