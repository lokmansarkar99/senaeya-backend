import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcarModel } from './carModel.interface';
import { CarModel } from './carModel.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { CarBrand } from '../carBrand/carBrand.model';

const createCarModel = async (payload: IcarModel): Promise<IcarModel> => {
     const isExistBrand = await CarBrand.findById(payload.brand);
     if (!isExistBrand) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found.');
     }
     const result = await CarModel.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarModel not found.');
     }
     return result;
};

const getAllCarModels = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IcarModel[] }> => {
     const queryBuilder = new QueryBuilder(CarModel.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCarModels = async (): Promise<IcarModel[]> => {
     const result = await CarModel.find();
     return result;
};

const updateCarModel = async (id: string, payload: Partial<IcarModel>): Promise<IcarModel | null> => {
     const isExist = await CarModel.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarModel not found.');
     }

     return await CarModel.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCarModel = async (id: string): Promise<IcarModel | null> => {
     const result = await CarModel.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarModel not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCarModel = async (id: string): Promise<IcarModel | null> => {
     const result = await CarModel.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CarModel not found.');
     }
     return result;
};

const getCarModelById = async (id: string): Promise<IcarModel | null> => {
     const result = await CarModel.findById(id);
     return result;
};

export const carModelService = {
     createCarModel,
     getAllCarModels,
     getAllUnpaginatedCarModels,
     updateCarModel,
     deleteCarModel,
     hardDeleteCarModel,
     getCarModelById,
};
