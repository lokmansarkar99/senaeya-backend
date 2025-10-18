import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcarBrand } from './carBrand.interface';
import { CarBrand } from './carBrand.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createCarBrand = async (payload: IcarBrand): Promise<IcarBrand> => {
     const result = await CarBrand.create(payload);
     if (!result) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrand not found.');
     }
     return result;
};

const getAllCarBrands = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IcarBrand[]; }> => {
     const queryBuilder = new QueryBuilder(CarBrand.find(), query);
     const result = await queryBuilder.filter().sort().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCarBrands = async (): Promise<IcarBrand[]> => {
     const result = await CarBrand.find().select('_id image title country');
     return result;
};

const updateCarBrand = async (id: string, payload: Partial<IcarBrand>): Promise<IcarBrand | null> => {
     const isExist = await CarBrand.findById(id);
     if (!isExist) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrand not found.');
     }

     if(isExist.image){
          unlinkFile(isExist.image);
     }
     return await CarBrand.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCarBrand = async (id: string): Promise<IcarBrand | null> => {
     const result = await CarBrand.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrand not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCarBrand = async (id: string): Promise<IcarBrand | null> => {
     const result = await CarBrand.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrand not found.');
     }
     if(result.image){
          unlinkFile(result.image);
     }
     return result;
};

const getCarBrandById = async (id: string): Promise<IcarBrand | null> => {
     const result = await CarBrand.findById(id);
     return result;
};   

export const carBrandService = {
     createCarBrand,
     getAllCarBrands,
     getAllUnpaginatedCarBrands,
     updateCarBrand,
     deleteCarBrand,
     hardDeleteCarBrand,
     getCarBrandById
};
