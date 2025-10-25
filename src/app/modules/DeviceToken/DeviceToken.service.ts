import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IDeviceToken } from './DeviceToken.interface';
import DeviceToken from './DeviceToken.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createDeviceToken = async (payload: IDeviceToken): Promise<IDeviceToken> => {
     const result = await DeviceToken.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'DeviceToken not found.');
     }
     return result;
};

const getAllDeviceTokens = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IDeviceToken[]; }> => {
     const queryBuilder = new QueryBuilder(DeviceToken.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedDeviceTokens = async (): Promise<IDeviceToken[]> => {
     const result = await DeviceToken.find();
     return result;
};

const updateDeviceToken = async (id: string, payload: Partial<IDeviceToken>): Promise<IDeviceToken | null> => {
     const isExist = await DeviceToken.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'DeviceToken not found.');
     }
     return await DeviceToken.findByIdAndUpdate(id, payload, { new: true });
};

const deleteDeviceToken = async (id: string): Promise<IDeviceToken | null> => {
     const result = await DeviceToken.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'DeviceToken not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteDeviceToken = async (id: string): Promise<IDeviceToken | null> => {
     const result = await DeviceToken.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'DeviceToken not found.');
     }
     return result;
};

const getDeviceTokenById = async (id: string): Promise<IDeviceToken | null> => {
     const result = await DeviceToken.findById(id);
     return result;
};   

export const DeviceTokenService = {
     createDeviceToken,
     getAllDeviceTokens,
     getAllUnpaginatedDeviceTokens,
     updateDeviceToken,
     deleteDeviceToken,
     hardDeleteDeviceToken,
     getDeviceTokenById
};
