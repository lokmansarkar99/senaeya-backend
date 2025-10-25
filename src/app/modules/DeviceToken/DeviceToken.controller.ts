import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DeviceTokenService } from './DeviceToken.service';

const createDeviceToken = catchAsync(async (req: Request, res: Response) => {
     const result = await DeviceTokenService.createDeviceToken(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceToken created successfully',
          data: result,
     });
});

const getAllDeviceTokens = catchAsync(async (req: Request, res: Response) => {
     const result = await DeviceTokenService.getAllDeviceTokens(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceTokens retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedDeviceTokens = catchAsync(async (req: Request, res: Response) => {
     const result = await DeviceTokenService.getAllUnpaginatedDeviceTokens();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceTokens retrieved successfully',
          data: result,
     });
});

const updateDeviceToken = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DeviceTokenService.updateDeviceToken(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceToken updated successfully',
          data: result || undefined,
     });
});

const deleteDeviceToken = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DeviceTokenService.deleteDeviceToken(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceToken deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteDeviceToken = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DeviceTokenService.hardDeleteDeviceToken(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceToken deleted successfully',
          data: result || undefined,
     });
});

const getDeviceTokenById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DeviceTokenService.getDeviceTokenById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'DeviceToken retrieved successfully',
          data: result || undefined,
     });
});  

export const DeviceTokenController = {
     createDeviceToken,
     getAllDeviceTokens,
     getAllUnpaginatedDeviceTokens,
     updateDeviceToken,
     deleteDeviceToken,
     hardDeleteDeviceToken,
     getDeviceTokenById
};
