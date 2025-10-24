import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { checkPhoneNumberService } from './checkPhoneNumber.service';

const createCheckPhoneNumber = catchAsync(async (req: Request, res: Response) => {
     const result = await checkPhoneNumberService.createCheckPhoneNumber(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CheckPhoneNumber created successfully',
          data: result,
     });
});


const getCheckPhoneNumberByPhoneNumber = catchAsync(async (req: Request, res: Response) => {
     const { phoneNumber } = req.params;
     const result = await checkPhoneNumberService.getCheckPhoneNumberByPhoneNumber(phoneNumber, req.body.otp);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'CheckPhoneNumber retrieved successfully',
          data: result || undefined,
     });
});  

export const checkPhoneNumberController = {
     getCheckPhoneNumberByPhoneNumber,
     createCheckPhoneNumber,
};
