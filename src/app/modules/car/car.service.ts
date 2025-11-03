import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ICar, IcarCreate } from './car.interface';
import { Car } from './car.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { CLIENT_CAR_TYPE } from '../client/client.enum';
import { imageService } from '../image/image.service';
import { generateSlug } from './car.utils';
import { CarModel } from '../carModel/carModel.model';

const createCar = async (payload: IcarCreate): Promise<ICar> => {
     console.log('🚀 ~ createCar ~ payload:', payload);
     const isExistCarModel = await CarModel.findOne({
          _id: payload.model,
          brand: payload.brand,
     });
     if (!isExistCarModel) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Car model not found.');
     }
     if (payload.carType == CLIENT_CAR_TYPE.SAUDI) {
          // payload must include plateNumberForSaudi
          if (
               !payload.plateNumberForSaudi?.symbol ||
               !payload.plateNumberForSaudi?.numberEnglish ||
               !payload.plateNumberForSaudi?.numberArabic ||
               !payload.plateNumberForSaudi?.alphabetsCombinations
          ) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for Saudi is required.');
          }
          if (payload.plateNumberForSaudi.symbol) {
               const isExistSymbol = await imageService.getImageById(payload.plateNumberForSaudi.symbol);
               if (!isExistSymbol) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Plate number for Saudi symbol not found.');
               }
          }
          payload.slugForSaudiCarPlateNumber = generateSlug(payload.plateNumberForSaudi);
          console.log('🚀 ~ payload.plateNumberForSaudi.slug:', payload.slugForSaudiCarPlateNumber);
          // find saudi car exist by number
          const isExistCar = await Car.findOne({
               slugForSaudiCarPlateNumber: payload.slugForSaudiCarPlateNumber,
               carType: CLIENT_CAR_TYPE.SAUDI,
          });
          if (isExistCar) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Car already exists by the slug.');
          }
     }
     if (payload.carType == CLIENT_CAR_TYPE.INTERNATIONAL) {
          // payload must include plateNumberForInternational
          if (!payload.plateNumberForInternational) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for international is required.');
          }

          // find international car exist by number
          const isExistCar = await Car.findOne({
               plateNumberForInternational: payload.plateNumberForInternational,
               carType: CLIENT_CAR_TYPE.INTERNATIONAL,
          });
          if (isExistCar) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Car already exists.');
          }
     }
     const result = await Car.create(payload);
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }
     return result;
};

const createCarWithSession = async (payload: IcarCreate, session: any) => {
     if (payload.carType == CLIENT_CAR_TYPE.SAUDI) {
          // payload must include plateNumberForSaudi
          if (
               !payload.plateNumberForSaudi?.symbol ||
               !payload.plateNumberForSaudi?.numberEnglish ||
               !payload.plateNumberForSaudi?.numberArabic ||
               !payload.plateNumberForSaudi?.alphabetsCombinations
          ) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for Saudi is required.');
          }
          if (payload.plateNumberForSaudi.symbol) {
               const isExistSymbol = await imageService.getImageById(payload.plateNumberForSaudi.symbol);
               if (!isExistSymbol) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Plate number for Saudi symbol not found.');
               }
          }
          payload.slugForSaudiCarPlateNumber = generateSlug(payload.plateNumberForSaudi);
          console.log('🚀 ~ payload.plateNumberForSaudi.slug:', payload.slugForSaudiCarPlateNumber);
          // find saudi car exist by number
          const isExistCar = await Car.findOne({
               slugForSaudiCarPlateNumber: payload.slugForSaudiCarPlateNumber,
               carType: CLIENT_CAR_TYPE.SAUDI,
          });
          if (isExistCar) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Car already exists by the slug.');
          }
     }
     if (payload.carType == CLIENT_CAR_TYPE.INTERNATIONAL) {
          // payload must include plateNumberForInternational
          if (!payload.plateNumberForInternational) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for international is required.');
          }

          // find international car exist by number
          const isExistCar = await Car.findOne({
               plateNumberForInternational: payload.plateNumberForInternational,
               carType: CLIENT_CAR_TYPE.INTERNATIONAL,
          });
          if (isExistCar) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Car already exists.');
          }
     }
     const [result] = await Car.create([payload], { session });
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }
     return result;
};

const getAllCars = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: ICar[] }> => {
     const queryBuilder = new QueryBuilder(
          Car.find()
               .populate({
                    path: 'client',
                    populate: {
                         path: 'clientId',
                    },
               })
               .populate({
                    path: 'model',
                    select: 'title',
               })
               .populate({
                    path: 'plateNumberForSaudi.symbol',
                    select: 'title image',
               })
               .populate({
                    path: 'brand',
                    select: '_id image title',
                    populate: {
                         path: 'country',
                         select: '_id image title',
                    },
               }),
          query,
     );
     const result = await queryBuilder.filter().sort().paginate().fields().search(['vin', 'model', 'year', 'description', 'plateNumberForInternational', 'slugForSaudiCarPlateNumber']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCars = async (): Promise<ICar[]> => {
     const result = await Car.find();
     return result;
};

const updateCar = async (id: string, payload: Partial<ICar>): Promise<ICar | null> => {
     const isExist = await Car.findById(id);
     if (!isExist) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }

     if (isExist.image) {
          unlinkFile(isExist.image);
     }
     if (payload.plateNumberForSaudi) {
          payload.slugForSaudiCarPlateNumber = generateSlug({
               symbol: (payload.plateNumberForSaudi.symbol ? payload.plateNumberForSaudi.symbol : isExist?.plateNumberForSaudi?.symbol) || '',
               numberEnglish: (payload.plateNumberForSaudi.numberEnglish ? payload.plateNumberForSaudi.numberEnglish : isExist?.plateNumberForSaudi?.numberEnglish) || '',
               numberArabic: (payload.plateNumberForSaudi.numberArabic ? payload.plateNumberForSaudi.numberArabic : isExist?.plateNumberForSaudi?.numberArabic) || '',
               alphabetsCombinations:
                    (payload.plateNumberForSaudi.alphabetsCombinations ? payload.plateNumberForSaudi.alphabetsCombinations : isExist?.plateNumberForSaudi?.alphabetsCombinations) || [],
          });

          payload.plateNumberForSaudi = {
               symbol: payload.plateNumberForSaudi.symbol || isExist?.plateNumberForSaudi?.symbol || '',
               numberEnglish: payload.plateNumberForSaudi.numberEnglish || isExist?.plateNumberForSaudi?.numberEnglish || '',
               numberArabic: payload.plateNumberForSaudi.numberArabic || isExist?.plateNumberForSaudi?.numberArabic || '',
               alphabetsCombinations: payload.plateNumberForSaudi.alphabetsCombinations || isExist?.plateNumberForSaudi?.alphabetsCombinations || [],
          };
     }

     const result = await Car.findByIdAndUpdate(id, payload, { new: true });
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }
     return result;
};

const deleteCar = async (id: string): Promise<ICar | null> => {
     const result = await Car.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCar = async (id: string): Promise<ICar | null> => {
     const result = await Car.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.');
     }
     if (result.image) {
          unlinkFile(result.image);
     }
     return result;
};

const getCarById = async (id: string): Promise<ICar | null> => {
     const result = await Car.findById(id).populate('model', 'title').populate('brand', 'title').populate('plateNumberForSaudi.symbol', 'title image').populate({
          path: 'client',
          select: 'clientId workShopNameAsClient clientType',
          populate: {
               path: 'clientId',
               select: 'name',
          },
     });
     return result;
};

export const carService = {
     createCar,
     getAllCars,
     getAllUnpaginatedCars,
     updateCar,
     deleteCar,
     hardDeleteCar,
     getCarById,
     createCarWithSession,
};
