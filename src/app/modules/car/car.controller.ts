import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { carService } from './car.service';

const createCar = catchAsync(async (req: Request, res: Response) => {
     const result = await carService.createCar(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Car created successfully',
          data: result,
     });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
     const result = await carService.getAllCars(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Cars retrieved successfully',
          data: result,
     });
});

const getAllCarsForAdmin = catchAsync(async (req: Request, res: Response) => {
     const result = await carService.getAllCarsForAdmin(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Cars retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedCars = catchAsync(async (req: Request, res: Response) => {
     const result = await carService.getAllUnpaginatedCars();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Cars retrieved successfully',
          data: result,
     });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carService.updateCar(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Car updated successfully',
          data: result || undefined,
     });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carService.deleteCar(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Car deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteCar = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carService.hardDeleteCar(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Car deleted successfully',
          data: result || undefined,
     });
});

const getCarById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await carService.getCarById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Car retrieved successfully',
          data: result || undefined,
     });
});

export const carController = {
     createCar,
     getAllCars,
     getAllCarsForAdmin,
     getAllUnpaginatedCars,
     updateCar,
     deleteCar,
     hardDeleteCar,
     getCarById,
};
