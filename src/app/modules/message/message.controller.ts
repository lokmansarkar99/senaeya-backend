import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { messageService } from './message.service';

const createMessage = catchAsync(async (req: Request, res: Response) => {
     const result = await messageService.createMessage(req.body, req.user);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message created successfully',
          data: result,
     });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
     const result = await messageService.getAllMessages(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Messages retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedMessages = catchAsync(async (req: Request, res: Response) => {
     const result = await messageService.getAllUnpaginatedMessages();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Messages retrieved successfully',
          data: result,
     });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await messageService.updateMessage(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message updated successfully',
          data: result || undefined,
     });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await messageService.deleteMessage(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteMessage = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await messageService.hardDeleteMessage(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message deleted successfully',
          data: result || undefined,
     });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await messageService.getMessageById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Message retrieved successfully',
          data: result || undefined,
     });
});  

export const messageController = {
     createMessage,
     getAllMessages,
     getAllUnpaginatedMessages,
     updateMessage,
     deleteMessage,
     hardDeleteMessage,
     getMessageById
};
