import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { workService } from './work.service';

const createWork = catchAsync(async (req: Request, res: Response) => {
     const result = await workService.createWork(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work created successfully',
          data: result,
     });
});

const createManyWorksByXLXS = catchAsync(async (req: Request, res: Response) => {
     const result = await workService.createManyWorksByXLXS(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work created successfully',
          data: result,
     });
});

const getAllWorks = catchAsync(async (req: Request, res: Response) => {
     const { result } = await workService.getAllWorks(req.query);

     const formattedResult = result.map((work: any) => {
          const doc = work.toObject ? work.toObject() : work;
          return {
               ...doc,
               type: doc.type ? doc.type.toLowerCase() : doc.type,
               workCategoryName: doc.workCategoryName?.workCategoryName || doc.workCategoryName,
          };
     });

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Works list fetched successfully',
          data: {
               result: formattedResult,
          },
     });
});

const getAllUnpaginatedWorks = catchAsync(async (req: Request, res: Response) => {
     const result = await workService.getAllUnpaginatedWorks();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Works retrieved successfully',
          data: result,
     });
});

const updateWork = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workService.updateWork(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work updated successfully',
          data: result || undefined,
     });
});

const deleteWork = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workService.deleteWork(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteWork = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workService.hardDeleteWork(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work deleted successfully',
          data: result || undefined,
     });
});

const getWorkById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workService.getWorkById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Work retrieved successfully',
          data: result || undefined,
     });
});  

export const workController = {
     createWork,
     createManyWorksByXLXS,
     getAllWorks,
     getAllUnpaginatedWorks,
     updateWork,
     deleteWork,
     hardDeleteWork,
     getWorkById
};
