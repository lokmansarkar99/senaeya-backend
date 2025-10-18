import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcarBrandCountries } from './carBrandCountries.interface';
import { CarBrandCountries } from './carBrandCountries.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createCarBrandCountries = async (payload: IcarBrandCountries): Promise<IcarBrandCountries> => {
     const result = await CarBrandCountries.create(payload);
     if (!result) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrandCountries not found.');
     }
     return result;
};

const getAllCarBrandCountriess = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IcarBrandCountries[]; }> => {
     const queryBuilder = new QueryBuilder(CarBrandCountries.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCarBrandCountriess = async (): Promise<IcarBrandCountries[]> => {
     const result = await CarBrandCountries.find().select('_id image title');
     return result;
};

const updateCarBrandCountries = async (id: string, payload: Partial<IcarBrandCountries>): Promise<IcarBrandCountries | null> => {
     const isExist = await CarBrandCountries.findById(id);
     if (!isExist) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrandCountries not found.');
     }

     if(isExist.image){
          unlinkFile(isExist.image);
     }
     return await CarBrandCountries.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCarBrandCountries = async (id: string): Promise<IcarBrandCountries | null> => {
     const result = await CarBrandCountries.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrandCountries not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCarBrandCountries = async (id: string): Promise<IcarBrandCountries | null> => {
     const result = await CarBrandCountries.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarBrandCountries not found.');
     }
     if(result.image){
          unlinkFile(result.image);
     }
     return result;
};

const getCarBrandCountriesById = async (id: string): Promise<IcarBrandCountries | null> => {
     const result = await CarBrandCountries.findById(id);
     return result;
};   

export const carBrandCountriesService = {
     createCarBrandCountries,
     getAllCarBrandCountriess,
     getAllUnpaginatedCarBrandCountriess,
     updateCarBrandCountries,
     deleteCarBrandCountries,
     hardDeleteCarBrandCountries,
     getCarBrandCountriesById
};
