import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { carModelService } from './carModel.service';

const createCarModel = catchAsync(async (req: Request, res: Response) => {
     const result = await carModelService.createCarModel(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel created successfully',
          data: result,
     });
});

const getAllCarModels = catchAsync(async (req: Request, res: Response) => {
     const result = await carModelService.getAllCarModels(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModels retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedCarModels = catchAsync(async (req: Request, res: Response) => {
     const result = await carModelService.getAllUnpaginatedCarModels();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModels retrieved successfully',
          data: result,
     });
});

const updateCarModel = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carModelService.updateCarModel(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel updated successfully',
          data: result || undefined,
     });
});

const deleteCarModel = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carModelService.deleteCarModel(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteCarModel = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carModelService.hardDeleteCarModel(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel deleted successfully',
          data: result || undefined,
     });
});

const getCarModelById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carModelService.getCarModelById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel retrieved successfully',
          data: result || undefined,
     });
});  

const getCarModelByBrandId = catchAsync(async (req: Request, res: Response) => {
     const { brandId } = req.params;
     const result = await carModelService.getCarModelByBrandId(brandId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CarModel retrieved successfully',
          data: result || undefined,
     });
});

export const carModelController = {
     createCarModel,
     getAllCarModels,
     getAllUnpaginatedCarModels,
     updateCarModel,
     deleteCarModel,
     hardDeleteCarModel,
     getCarModelById,
     getCarModelByBrandId
};
