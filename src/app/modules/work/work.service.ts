import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Iwork } from './work.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { getXLXStoJSON } from './work.utils';
import mongoose, { ClientSession } from 'mongoose';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';
import { WorksCategories } from '../worksCategories/worksCategories.model';
import { Work } from './work.model';

const createWork = async (payload: Iwork & { titleObj?: Iwork['title']; workCategoryName: string }): Promise<Iwork> => {
     const isExistWorkCategoryName = await WorksCategories.findOne({ workCategoryName: payload.workCategoryName });
     if (!isExistWorkCategoryName) {
          const createdWorkCategory = await WorksCategories.create({ workCategoryName: payload.workCategoryName });
          payload.workCategoryName = createdWorkCategory.workCategoryName;
     }
     if (payload.title) {
          delete payload.titleObj;
          const [titleObj]: [Iwork['title']] = await Promise.all([buildTranslatedField(payload.title as any)]);
          payload.title = titleObj;
     } else if (payload.titleObj) {
          payload.title = payload.titleObj;
     }
     const result = await Work.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     return result;
};

const createManyWorksByXLXS = async (payload: Iwork & { document: string }): Promise<Iwork[]> => {
     console.log('🚀 ~ createManyWorksByXLXS ~ payload:', payload);
     const docLocation = payload.document;
     const backToRootFolderPath = '../../../../uploads/document';
     const xlxsToJsonParsedData = getXLXStoJSON(docLocation, backToRootFolderPath);
     // console.log('🚀 ~ createManyWorksByXLXS ~ xlxsToJsonParsedData:', xlxsToJsonParsedData);

     const structuredData = await Promise.all(
          xlxsToJsonParsedData.map(async (element: any) => {
               const isExistWorkCategoryName = await WorksCategories.findOne({ workCategoryName: element.workCategoryName });
               if (!isExistWorkCategoryName) {
                    const createdWorkCategory = await WorksCategories.create({ workCategoryName: element.workCategoryName });
                    element.workCategoryName = createdWorkCategory.workCategoryName;
               }
               return {
                    title: {
                         ar: element.ar,
                         bn: element.bn,
                         en: element.en,
                         hi: element.hi,
                         tl: element.tl,
                         ur: element.ur,
                    },
                    workCategoryName: element.workCategoryName,
                    code: element.code,
               };
          }),
     );
     console.log('🚀 ~ createManyWorksByXLXS ~ structuredData:', structuredData);
     // throw new Error("test");

     // use mongoose transaction
     const maxRetries = 3;
     let attempt = 0;

     while (attempt < maxRetries) {
          attempt++;
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
               // Create the examination
               const result = await Work.insertMany(structuredData, { session });
               console.log('🚀 ~ createManyWorksByXLXS ~ result:', result);

               if (!result) {
                    if (payload.document) {
                         unlinkFile(payload.document); // Assuming unlinkFile is a function to remove the file after processing
                    }
                    throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
               }

               // Commit the transaction
               await session.commitTransaction();
               session.endSession();
               // Clean up the uploaded file if necessary
               if (payload.document) {
                    unlinkFile(payload.document);
               }
               return result;
          } catch (error) {
               // Abort the transaction on error
               await session.abortTransaction();
               session.endSession();

               console.error('Error reading the Excel file:', error);

               if (payload.document) {
                    unlinkFile(payload.document); // Clean up the uploaded file if necessary
               }
               throw error;
          }
     }

     throw new Error('Exceeded maximum retries for transaction');
};

const getAllWorks = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: Iwork[] }> => {
     const queryBuilder = new QueryBuilder(Work.find(), query);
     const result = await queryBuilder.filter().sort().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedWorks = async (): Promise<Iwork[]> => {
     const result = await Work.find();
     return result;
};

const updateWork = async (id: string, payload: Partial<Iwork & { titleObj?: Iwork['title'] }>): Promise<Iwork | null> => {
     const isExist = await Work.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     if (payload.title) {
          delete payload.titleObj;
          const [titleObj]: [Iwork['title']] = await Promise.all([buildTranslatedField(payload.title as any)]);
          payload.title = titleObj;
     } else if (payload.titleObj) {
          payload.title = payload.titleObj;
     }

     console.log('🚀 ~ updateWork ~ payload:', payload);
     return await Work.findByIdAndUpdate(id, payload, { new: true });
};

const deleteWork = async (id: string): Promise<Iwork | null> => {
     const result = await Work.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteWork = async (id: string): Promise<Iwork | null> => {
     const result = await Work.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     return result;
};

const getWorkById = async (id: string): Promise<Iwork | null> => {
     const result = await Work.findById(id);
     return result;
};

export const workService = {
     createWork,
     createManyWorksByXLXS,
     getAllWorks,
     getAllUnpaginatedWorks,
     updateWork,
     deleteWork,
     hardDeleteWork,
     getWorkById,
};
