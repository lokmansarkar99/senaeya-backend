export interface IshortUrl {
     shortUrl: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IshortUrlFilters = {
     searchTerm?: string;
};
