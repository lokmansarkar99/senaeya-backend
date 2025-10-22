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
     workCategoryName: string;
     type?: WorkType | string;
     code: string;
     cost?: number;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IworkFilters = {
     searchTerm?: string;
};
