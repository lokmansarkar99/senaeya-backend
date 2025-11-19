import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import unlinkFile from '../../../shared/unlinkFile';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';
import QueryBuilder from '../../builder/QueryBuilder';
import { getXLXStoJSON } from '../work/work.utils';
import { SparePartType } from './spareParts.enum';
import { ISpareParts } from './spareParts.interface';
import { SpareParts } from './spareParts.model';

const createSpareParts = async (payload: Partial<ISpareParts & { titleObj?: ISpareParts['title']; workCategoryName: string }>): Promise<ISpareParts> => {
     if (payload.itemName) {
          delete payload.titleObj;
          const [titleObj]: [ISpareParts['title']] = await Promise.all([buildTranslatedField(payload.itemName as any)]);
          payload.title = titleObj;
     } else if (payload.titleObj) {
          payload.title = payload.titleObj;
          payload.itemName = payload.titleObj.en;
     }
     payload.code = payload.code!.toLowerCase();
     // check if already spare parts exist or not
     const isExistSparePartForSameProvider = await SpareParts.findOne({ code: payload.code, providerWorkShopId: payload.providerWorkShopId });
     if (isExistSparePartForSameProvider) {
          throw new AppError(StatusCodes.CREATED, 'Spare part already exist');
     }
     const result = await SpareParts.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     return result;
};

const createManySparePartsByXLXS = async (payload: ISpareParts & { document: string }): Promise<ISpareParts[]> => {
     console.log('🚀 ~ createManySparePartsByXLXS ~ payload:', payload);
     const docLocation = payload.document;
     const backToRootFolderPath = '../../../../uploads/document';
     const xlxsToJsonParsedData = getXLXStoJSON(docLocation, backToRootFolderPath);
     // console.log('🚀 ~ createManyWorksByXLXS ~ xlxsToJsonParsedData:', xlxsToJsonParsedData);

     const structuredData = await Promise.all(
          xlxsToJsonParsedData.map(async (element: any) => {
               return {
                    title: {
                         ar: element.ar,
                         bn: element.bn,
                         en: element.en,
                         hi: element.hi,
                         tl: element.tl,
                         ur: element.ur,
                    },
                    itemName: element.en,
                    type: SparePartType.SPARE_PART,
                    code: element.code,
               };
          }),
     );
     console.log('🚀 ~ createManySparePartsByXLXS ~ structuredData:', structuredData);
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
               const result = await SpareParts.insertMany(structuredData, { session });
               console.log('🚀 ~ createManySparePartsByXLXS ~ result:', result);

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

const getAllSpareParts = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: ISpareParts[] }> => {
     const queryBuilder = new QueryBuilder(SpareParts.find().populate('providerWorkShopId', 'workshopNameEnglish workshopNameArabic'), query);
     const result = await queryBuilder.filter().sort().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedSpareParts = async (): Promise<ISpareParts[]> => {
     const result = await SpareParts.find();
     return result;
};

const updateSpareParts = async (id: string, payload: Partial<ISpareParts & { titleObj?: ISpareParts['title'] }>): Promise<ISpareParts | null> => {
     const isExist = await SpareParts.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     if (payload.title) {
          delete payload.titleObj;
          const [titleObj]: [ISpareParts['title']] = await Promise.all([buildTranslatedField(payload.title as any)]);
          payload.title = titleObj;
     } else if (payload.titleObj) {
          payload.title = payload.titleObj;
     }

     console.log('🚀 ~ updateWork ~ payload:', payload);
     return await SpareParts.findByIdAndUpdate(id, payload, { new: true });
};

const deleteSpareParts = async (id: string): Promise<ISpareParts | null> => {
     const result = await SpareParts.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteSpareParts = async (id: string): Promise<ISpareParts | null> => {
     const result = await SpareParts.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Work not found.');
     }
     return result;
};

const getSparePartsById = async (id: string): Promise<ISpareParts | null> => {
     const result = await SpareParts.findById(id);
     return result;
};

const createManySpareParts = async (payload: any): Promise<ISpareParts[]> => {
     const result = await Promise.all(payload.data!.map((item: any) => createSpareParts(item)));
     return result;
};

const getSparePartsByCode = async (code: string): Promise<ISpareParts | null> => {
     const result = await SpareParts.findOne({ code: code.toLowerCase() });
     return result;
};

export const sparePartsService = {
     createSpareParts,
     createManySparePartsByXLXS,
     getAllSpareParts,
     getAllUnpaginatedSpareParts,
     updateSpareParts,
     deleteSpareParts,
     hardDeleteSpareParts,
     getSparePartsById,
     createManySpareParts,
     getSparePartsByCode,
};
