import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IworksCategories } from './worksCategories.interface';
import { WorksCategories } from './worksCategories.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';

const createWorksCategories = async (payload: IworksCategories): Promise<IworksCategories> => {
     const [titleObj, descriptionObj]: [IworksCategories['title'], IworksCategories['description']] = await Promise.all([
          buildTranslatedField(payload.title as any),
          buildTranslatedField(payload.description as any),
     ]);
     payload.title = titleObj;
     payload.description = descriptionObj;
     const result = await WorksCategories.create(payload);
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'WorksCategories not found.');
     }
     return result;
};

const getAllWorksCategoriess = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IworksCategories[] }> => {
     const queryBuilder = new QueryBuilder(WorksCategories.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedWorksCategoriess = async (): Promise<IworksCategories[]> => {
     const result = await WorksCategories.find();
     return result;
};

const updateWorksCategories = async (id: string, payload: Partial<IworksCategories>): Promise<IworksCategories | null> => {
     const isExist = await WorksCategories.findById(id);
     if (!isExist) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'WorksCategories not found.');
     }

     if (isExist.image) {
          unlinkFile(isExist.image);
     }
     if (payload.title) {
          const [titleObj]: [IworksCategories['title']] = await Promise.all([buildTranslatedField(payload.title as any)]);
          payload.title = titleObj;
     }
     if (payload.description) {
          const [descriptionObj]: [IworksCategories['description']] = await Promise.all([buildTranslatedField(payload.description as any)]);
          payload.description = descriptionObj;
     }
     return await WorksCategories.findByIdAndUpdate(id, payload, { new: true });
};

const deleteWorksCategories = async (id: string): Promise<IworksCategories | null> => {
     const result = await WorksCategories.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'WorksCategories not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteWorksCategories = async (id: string): Promise<IworksCategories | null> => {
     const result = await WorksCategories.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'WorksCategories not found.');
     }
     if (result.image) {
          unlinkFile(result.image);
     }
     return result;
};

const getWorksCategoriesById = async (id: string): Promise<IworksCategories | null> => {
     const result = await WorksCategories.findById(id);
     return result;
};

export const worksCategoriesService = {
     createWorksCategories,
     getAllWorksCategoriess,
     getAllUnpaginatedWorksCategoriess,
     updateWorksCategories,
     deleteWorksCategories,
     hardDeleteWorksCategories,
     getWorksCategoriesById,
};
