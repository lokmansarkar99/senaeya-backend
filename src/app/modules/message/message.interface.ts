import { Types } from "mongoose";
import { MessageStatus } from "./message.enum";

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
     status:MessageStatus
}

export type ImessageFilters = {
     searchTerm?: string;
};
