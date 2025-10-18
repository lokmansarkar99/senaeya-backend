import { StatusCodes } from 'http-status-codes';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createPackageToDB = async (payload: IPackage): Promise<IPackage | null> => {
     const result = await Package.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Package');
     }

     return result;
};

const updatePackageToDB = async (id: string, payload: IPackage): Promise<IPackage | null> => {
     const isExistPackage: any = await Package.findById(id);
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     const updatedPackage = await Package.findByIdAndUpdate(id, payload, {
          new: true,
          runValidators: true,
     });

     if (!updatedPackage) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update package');
     }

     return updatedPackage;
};

const getPackageFromDB = async (queryParms: Record<string, unknown>) => {
     const query: any = {
          isDeleted: false,
     };

     const queryBuilder = new QueryBuilder(Package.find(query), queryParms);
     const packages = await queryBuilder.filter().sort().paginate().fields().sort().modelQuery.exec();
     console.log(packages);
     const meta = await queryBuilder.countTotal();
     return {
          packages,
          meta,
     };
};
const getPackageByUserFromDB = async (queryParms: Record<string, unknown>) => {
     const query: any = {
          status: 'active',
          isDeleted: false,
     };

     const queryBuilder = new QueryBuilder(Package.find(query), queryParms);
     const packages = await queryBuilder.filter().sort().paginate().fields().sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          packages,
          meta,
     };
};

const getPackageDetailsFromDB = async (id: string): Promise<IPackage | null> => {
     if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
     }
     const result = await Package.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }
     return result;
};

const deletePackageToDB = async (id: string): Promise<IPackage | null> => {
     const isExistPackage: any = await Package.findById(id);
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     try {
          // Update the package status in your DB
          const result = await Package.findByIdAndUpdate(
               { _id: id },
               {
                    status: 'inactive',
                    isDeleted: true,
                    deletedAt: new Date(), // Add timestamp for when it was deleted
               },
               { new: true },
          );

          if (!result) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Package');
          }

          return result;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, `Failed to delete package: ${error.message}`);
     }
};

export const PackageService = {
     createPackageToDB,
     updatePackageToDB,
     getPackageFromDB,
     getPackageDetailsFromDB,
     deletePackageToDB,
     getPackageByUserFromDB,
};
