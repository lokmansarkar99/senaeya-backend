export interface IcheckPhoneNumber {
     phoneNumber: string;
     otp?: number;
     isVerified: boolean;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IcheckPhoneNumberFilters = {
     searchTerm?: string;
};
