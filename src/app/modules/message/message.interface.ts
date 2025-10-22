import { Types } from "mongoose";

export interface Imessage {
     providerWorkShopId: Types.ObjectId;
     message:string;
     data: any[];
     name?:string;
     contact:string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type ImessageFilters = {
     searchTerm?: string;
};
