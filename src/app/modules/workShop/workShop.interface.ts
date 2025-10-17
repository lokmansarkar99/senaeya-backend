import { Types } from 'mongoose';

export interface IGeoLocation {
     type: 'Point';
     coordinates: [number, number]; // [longitude, latitude]
}

export type TDaysOfWeek = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface IWorkingSubSchedule {
     startDay: TDaysOfWeek;
     endDay: TDaysOfWeek;
     startTime: string;
     endTime: string;
}

export interface IworkShop {
     _id?: Types.ObjectId | string;
     workshopNameEnglish: string;
     workshopNameArabic: string;
     unn: string; // unified national number | total digit: 10; startingWith: 7
     crn: string; // commercial registration number | total digit: 10;
     mln: string; // municipality license number | unique | total digit: 11; startingWith: 4
     address: string;
     taxVatNumber: string; // total digit: 15; startingWith: 3
     bankAccountNumber?: string; // total letters: 24; startingWith: "SA"
     isAvailableMobileWorkshop: boolean;
     workshopGEOlocation: IGeoLocation;
     regularWorkingSchedule: IWorkingSubSchedule;
     ramadanWorkingSchedule: IWorkingSubSchedule;
     ownerId: Types.ObjectId;
     helperUserId: Types.ObjectId | null; // get it from owner.helperUserId
     image?: string;
     description?: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
     subscriptionId?: Types.ObjectId | null;
     generatedInvoiceCount: number;
}

export type IworkShopFilters = {
     searchTerm?: string;
};
