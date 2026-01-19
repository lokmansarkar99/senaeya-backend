export interface IAutoIncrement {
     value: number;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IAutoIncrementFilters = {
     searchTerm?: string;
};
