import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { clientService } from './client.service';

const createClient = catchAsync(async (req: Request, res: Response) => {
     const result = await clientService.createClient(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client created successfully',
          data: result,
     });
});

const updateClientDuringCreate = catchAsync(async (req: Request, res: Response) => {
     const result = await clientService.updateClientDuringCreate(req.user, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client created successfully',
          data: result,
     });
});

const getAllClients = catchAsync(async (req: Request, res: Response) => {
     const result = await clientService.getAllClients(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Clients retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedClients = catchAsync(async (req: Request, res: Response) => {
     const result = await clientService.getAllUnpaginatedClients();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Clients retrieved successfully',
          data: result,
     });
});

const updateClient = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await clientService.updateClient(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client updated successfully',
          data: result || undefined,
     });
});

const deleteClient = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await clientService.deleteClient(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteClient = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await clientService.hardDeleteClient(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client deleted successfully',
          data: result || undefined,
     });
});

const getClientById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await clientService.getClientById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client retrieved successfully',
          data: result || undefined,
     });
});

const getClientByClientContact = catchAsync(async (req: Request, res: Response) => {
     const { contact } = req.params;
     const { providerWorkShopId } = req.body;
     const result = await clientService.getClientByClientContact(contact, providerWorkShopId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client retrieved successfully',
          data: result || undefined,
     });
});

const toggleClientStatus = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await clientService.toggleClientStatus(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client status toggled successfully',
          data: result || undefined,
     });
});

const sendMessageToRecieveCar = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     await clientService.sendMessageToRecieveCar(id, req.body.providerWorkShopId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message sent successfully',
     });
});

const getClienstByCarNumber = catchAsync(async (req: Request, res: Response) => {
     const { carNumber } = req.params;
     const { providerWorkShopId } = req.body;
     const result = await clientService.getClienstByCarNumber(carNumber, providerWorkShopId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Client retrieved successfully',
          data: result || undefined,
     });
});

export const clientController = {
     createClient,
     updateClientDuringCreate,
     getAllClients,
     getAllUnpaginatedClients,
     updateClient,
     deleteClient,
     hardDeleteClient,
     getClientById,
     getClientByClientContact,
     toggleClientStatus,
     sendMessageToRecieveCar,
     getClienstByCarNumber,
};
