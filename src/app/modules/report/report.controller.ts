import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { reportService } from './report.service';

const getAllReportsByCreatedDateRange = catchAsync(async (req: Request, res: Response) => {
     const tokenWithBearer = req.headers.authorization;
     const access_token = tokenWithBearer!.split(' ')[1];
     let { providerWorkShopId } = req.body;
     if (!providerWorkShopId) {
          providerWorkShopId = req.query.providerWorkShopId as string;
     }
     const result = await reportService.getAllReportsByCreatedDateRange(req.query, providerWorkShopId, req.user, access_token);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Reports retrieved successfully',
          data: result,
     });
});

const getDashboardReport = catchAsync(async (req: Request, res: Response) => {
     const result = await reportService.getDashboardReport();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Reports retrieved successfully',
          data: result,
     });
});

export const reportController = {
     getAllReportsByCreatedDateRange,
     getDashboardReport,
};
