import { Types } from "mongoose";

export interface IcarModel {
     brand: Types.ObjectId;
     title: string;
     description?:string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IcarModelFilters = {
     searchTerm?: string;
};
