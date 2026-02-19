import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { invoiceService } from './invoice.service';

const createInvoice = catchAsync(async (req: Request, res: Response) => {
     const result = await invoiceService.createInvoice(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice created successfully',
          data: result,
     });
});

const getAllInvoices = catchAsync(async (req: Request, res: Response) => {
     const result = await invoiceService.getAllInvoices(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoices retrieved successfully',
          data: result,
     });
});

const getAllInvoicesWithProvider = catchAsync(async (req: Request, res: Response) => {
     const { providerWorkShopId } = req.body;
     const result = await invoiceService.getAllInvoicesWithProvider(req.query, providerWorkShopId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoices retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedInvoices = catchAsync(async (req: Request, res: Response) => {
     const result = await invoiceService.getAllUnpaginatedInvoices();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoices retrieved successfully',
          data: result,
     });
});

const updateInvoice = catchAsync(async (req: Request, res: Response) => {
     console.log("checkign invoice checking__2")
     const { id } = req.params;
     const result = await invoiceService.updateInvoice(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice updated successfully',
          data: result || undefined,
     });
});

const deleteInvoice = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await invoiceService.deleteInvoice(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteInvoice = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await invoiceService.hardDeleteInvoice(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice deleted successfully',
          data: result || undefined,
     });
});

const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
     console.log("checking HIT invoice __1 byId ")
     const { id } = req.params;
     const result = await invoiceService.getInvoiceById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice retrieved successfully',
          data: result || undefined,
     });
});

const releaseInvoice = catchAsync(async (req: Request, res: Response) => {
     const { invoiceId } = req.params;
     const result = await invoiceService.releaseInvoice(invoiceId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice retrieved successfully',
          data: result || undefined,
     });
});

const resendInvoice = catchAsync(async (req: Request, res: Response) => {
     const { invoiceId } = req.params;
     const result = await invoiceService.resendInvoice(invoiceId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invoice retrieved successfully',
          data: result || undefined,
     });
});

export const invoiceController = {
     createInvoice,
     getAllInvoices,
     getAllInvoicesWithProvider,
     getAllUnpaginatedInvoices,
     updateInvoice,
     deleteInvoice,
     hardDeleteInvoice,
     getInvoiceById,
     releaseInvoice,
     resendInvoice,
};
