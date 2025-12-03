import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { reportService } from './report.service';

const getAllReportsByCreatedDateRange = catchAsync(async (req: Request, res: Response) => {
     const { providerWorkShopId } = req.body;
     const result = await reportService.getAllReportsByCreatedDateRange(req.query, providerWorkShopId, req.user);

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
