import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';
import { calculateDiscount } from './coupon.utils';
import { Package } from '../package/package.model';

const createCoupon = async (couponData: Partial<ICoupon>, user: any) => {
     const isExistPackage = await Package.findById({ _id: couponData.package });

     if (!isExistPackage) {
          throw new AppError(StatusCodes.BAD_REQUEST, `Package doesn't exit.`);
     }
     const coupon = new Coupon({
          ...couponData,
          createdBy: user.id,
     });
     return await coupon.save();
};

const getAllCoupon = async (query: Record<string, unknown>) => {
     const brandQuery = new QueryBuilder(Coupon.find(), query).search(['code']).filter().sort().paginate().fields();

     const result = await brandQuery.modelQuery;
     const meta = await brandQuery.countTotal();

     return {
          meta,
          result,
     };
};

const updateCoupon = async (payload: Partial<ICoupon>, couponCode: string, user: any) => {
     console.log({ payload, couponCode });

     const currentDate = new Date();

     const coupon = await Coupon.findOne({ code: couponCode });

     if (!coupon) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
     }

     if (coupon.endDate < currentDate) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
     }

     const updatedCoupon = await Coupon.findByIdAndUpdate(coupon._id, { $set: payload }, { new: true, runValidators: true });

     return updatedCoupon;
};

const getTryCouponByCode = async (packageId: string, couponCode: string) => {
     const isExistPackage = await Package.findById({ _id: packageId });

     if (!isExistPackage) {
          throw new AppError(StatusCodes.BAD_REQUEST, `Package doesn't exit.`);
     }
     const currentDate = new Date();

     const coupon = await Coupon.findOne({ code: couponCode });

     if (!coupon) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
     }

     if (!coupon.isActive) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon is inactive.');
     }

     if (coupon.usageLimit) {
          if (coupon.usedCount >= coupon.usageLimit) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon usage limit exceeded.');
          }
     }

     if (coupon.endDate < currentDate) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
     }

     if (coupon.startDate > currentDate) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has not started.');
     }

     const discountAmount = calculateDiscount(coupon, Number(isExistPackage.price));

     const discountedPrice = Number(isExistPackage.price) - discountAmount;

     return { coupon, discountedPrice, discountAmount };
};

const deleteCoupon = async (couponId: string, user: any) => {
     const coupon = await Coupon.findById(couponId);

     if (!coupon) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
     }

     await Coupon.updateOne({ _id: coupon._id }, { isDeleted: true });

     return { message: 'Coupon deleted successfully.' };
};

const getAllCouponByShopId = async (shopId: string, user: any) => {
     const coupon = await Coupon.find({ shopId });

     return coupon;
};

const getCouponById = async (couponId: string) => {
     const coupon = await Coupon.findById(couponId);

     return coupon;
};

export const CouponService = {
     createCoupon,
     getAllCoupon,
     updateCoupon,
     getTryCouponByCode,
     deleteCoupon,
     getAllCouponByShopId,
     getCouponById,
};
