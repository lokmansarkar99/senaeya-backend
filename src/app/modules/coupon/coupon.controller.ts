import { Request, Response } from 'express';
import { CouponService } from './coupon.service';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
     const result = await CouponService.createCoupon(req.body, req.user as any);

     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Coupon created successfully',
          data: result,
     });
});

const getAllCoupon = catchAsync(async (req: Request, res: Response) => {
     const result = await CouponService.getAllCoupon(req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coupon fetched successfully',
          data: result,
     });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
     const { couponCode } = req.params;
     const result = await CouponService.updateCoupon(req.body, couponCode, req.user as any);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coupon updated successfully',
          data: result,
     });
});

const getTryCouponByCode = catchAsync(async (req: Request, res: Response) => {
     const { couponCode } = req.params;
     const { packageId } = req.body;

     const result = await CouponService.getTryCouponByCode(packageId as string, couponCode);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coupon fetched successfully',
          data: result,
     });
});
const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
     const { couponId } = req.params;

     const result = await CouponService.deleteCoupon(couponId, req.user as any);

     res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          success: true,
          message: result.message,
          data: null,
     });
});

const getAllCouponByShopId = catchAsync(async (req: Request, res: Response) => {
     const { shopId } = req.params;

     const result = await CouponService.getAllCouponByShopId(shopId, req.user as any);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coupon fetched successfully',
          data: result,
     });
});

const getCouponById = catchAsync(async (req: Request, res: Response) => {
     const { couponId } = req.params;

     const result = await CouponService.getCouponById(couponId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coupon fetched successfully',
          data: result,
     });
});

export const CouponController = {
     createCoupon,
     getAllCoupon,
     updateCoupon,
     getTryCouponByCode,
     deleteCoupon,
     getAllCouponByShopId,
     getCouponById,
};
