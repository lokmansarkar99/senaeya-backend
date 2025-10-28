import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { workShopService } from './workShop.service';

const createWorkShop = catchAsync(async (req: Request, res: Response) => {
     const result = await workShopService.createWorkShop(req.body, req.user);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop created successfully',
          data: result,
     });
});

const getAllWorkShops = catchAsync(async (req: Request, res: Response) => {
     const result = await workShopService.getAllWorkShops(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShops retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedWorkShops = catchAsync(async (req: Request, res: Response) => {
     const result = await workShopService.getAllUnpaginatedWorkShops();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShops retrieved successfully',
          data: result,
     });
});

const updateWorkShop = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workShopService.updateWorkShop(id, req.body, req.user);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop updated successfully',
          data: result || undefined,
     });
});

const deleteWorkShop = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workShopService.deleteWorkShop(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteWorkShop = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workShopService.hardDeleteWorkShop(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop deleted successfully',
          data: result || undefined,
     });
});

const getWorkShopById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await workShopService.getWorkShopById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop retrieved successfully',
          data: result || undefined,
     });
}); 

const getWorkShopByContact = catchAsync(async (req: Request, res: Response) => {
     const { contact } = req.params;
     const result = await workShopService.getWorkShopByContact(contact);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop retrieved successfully',
          data: result || undefined,
     });
});

const getWorkShopBycrnMlnUnnTax = catchAsync(async (req: Request, res: Response) => {
     const { crn, mln, unn, taxVatNumber='' } = req.query;
     const result = await workShopService.getWorkShopBycrnMlnUnnTax(crn as string, mln as string, unn as string, taxVatNumber as string);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'WorkShop retrieved successfully',
          data: result || undefined,
     });
});

export const workShopController = {
     createWorkShop,
     getAllWorkShops,
     getAllUnpaginatedWorkShops,
     updateWorkShop,
     deleteWorkShop,
     hardDeleteWorkShop,
     getWorkShopById,
     getWorkShopByContact,
     getWorkShopBycrnMlnUnnTax
};
