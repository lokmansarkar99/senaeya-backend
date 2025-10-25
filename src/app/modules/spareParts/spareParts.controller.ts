import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { sparePartsService } from './spareParts.service';

const createSpareParts = catchAsync(async (req: Request, res: Response) => {
     const result = await sparePartsService.createSpareParts(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work created successfully',
          data: result,
     });
});

const createManySparePartsByXLXS = catchAsync(async (req: Request, res: Response) => {
     const result = await sparePartsService.createManySparePartsByXLXS(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work created successfully',
          data: result,
     });
});

const getAllSpareParts = catchAsync(async (req: Request, res: Response) => {
     const result = await sparePartsService.getAllSpareParts(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Works retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedSpareParts = catchAsync(async (req: Request, res: Response) => {
     const result = await sparePartsService.getAllUnpaginatedSpareParts();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Works retrieved successfully',
          data: result,
     });
});

const updateSpareParts = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await sparePartsService.updateSpareParts(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work updated successfully',
          data: result || undefined,
     });
});

const deleteSpareParts = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await sparePartsService.deleteSpareParts(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteSpareParts = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await sparePartsService.hardDeleteSpareParts(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work deleted successfully',
          data: result || undefined,
     });
});

const getSparePartsById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await sparePartsService.getSparePartsById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work retrieved successfully',
          data: result || undefined,
     });
});  

const createManySpareParts = catchAsync(async (req: Request, res: Response) => {
     const result = await sparePartsService.createManySpareParts(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work created successfully',
          data: result,
     });
});

const getSparePartsByCode = catchAsync(async (req: Request, res: Response) => {
     const { code } = req.params;
     const result = await sparePartsService.getSparePartsByCode(code);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work retrieved successfully',
          data: result || undefined,
     });
});

export const sparePartsController = {
     createSpareParts,
     createManySparePartsByXLXS,
     createManySpareParts,
     getAllSpareParts,
     getAllUnpaginatedSpareParts,
     updateSpareParts,
     deleteSpareParts,
     hardDeleteSpareParts,
     getSparePartsById,
     getSparePartsByCode
};
