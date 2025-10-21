import { Types } from "mongoose";
import { CLIENT_CAR_TYPE } from "../client/client.enum";

export interface ICar {
     providerWorkShopId: Types.ObjectId;
     brand: Types.ObjectId;
     model: Types.ObjectId;
     year: string;
     vin: string;
     client?: Types.ObjectId | null;
     image?: string;
     description?:string;
     carType?: CLIENT_CAR_TYPE;
     plateNumberForInternational?: string;
     plateNumberForSaudi?: {
          symbol: string;
          numberEnglish: string;
          numberArabic: string;
          alphabetsCombinations: string[];
     };
     slugForSaudiCarPlateNumber: string | null;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IcarFilters = {
     searchTerm?: string;
};


// Creation payload type (omit system-managed fields)
export type IcarCreate = Omit<ICar, 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'> & {
     brand: Types.ObjectId | string;
     client?: Types.ObjectId | string | null;
     carType?: CLIENT_CAR_TYPE;
};