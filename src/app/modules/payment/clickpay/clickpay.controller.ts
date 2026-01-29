import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { CouponService } from '../../coupon/coupon.service';
import { default_vat } from '../../invoice/invoice.enum';
import { Package } from '../../package/package.model';
import Settings from '../../settings/settings.model';
import { Subscription } from '../../subscription/subscription.model';
import { TRAN_CLASS, TRAN_TYPE } from './clickpay.enum';
import { CLICKPAY_CURRENCY } from './clickpay.interface';
import { initiatePaymentService } from './clickpay.service';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
     const isExistPackage = await Package.findById(req.params.packageId);
     if (!isExistPackage) {
          throw new Error('Package not found');
     }
     let isExistCoupon;
     let toBePaidAmount = isExistPackage.price;
     let flatDiscountedAmount = 0;
     if (req.query.couponCode) {
          isExistCoupon = await CouponService.getTryCouponByCode(req.params.packageId, req.query.couponCode as string);
          console.log('🚀 ~ isExistCoupon:', isExistCoupon);
          if (!isExistCoupon) {
               throw new Error('Coupon not found for this package');
          }
          toBePaidAmount = isExistCoupon.discountedPrice;
          flatDiscountedAmount = isExistCoupon.discountedPrice;
     }
     // checke already subscribed and not expired
     const isExistSubscription = await Subscription.findOne({
          workshop: req.body.providerWorkShopId,
          package: req.params.packageId,
          status: 'active',
          currentPeriodEnd: { $gt: new Date().toISOString() },
     });
     if (isExistSubscription) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You are already subscribed');
     }
     let vatPercent = default_vat;
     const appSettings = await Settings.findOne({ providerWorkShopId: undefined }).select('defaultVat');
     if (appSettings && appSettings.defaultVat) {
          vatPercent = appSettings.defaultVat as number;
     }
     // const flatVatAmount = (toBePaidAmount * vatPercent) / 100;
     const flatVatAmount = 0;
     toBePaidAmount = toBePaidAmount + flatVatAmount;

     const paymentRequest = {
          customer_details: {
               name: '',
               email: 'senaeya.app@gmail.com',
               phone: '966570673000',
               street1: 'Riyadh',
               city: 'Riyadh',
               state: 'RIYADH',
               country: 'SA',
               ip: '127.0.0.1',
          },
          cart_amount: toBePaidAmount,
          cart_currency: CLICKPAY_CURRENCY,
          cart_description: isExistPackage.description || 'Order Payment',
          cart_id: isExistPackage._id.toString(),
          tran_type: TRAN_TYPE.SALE,
          tran_class: TRAN_CLASS.ECOM,
          callback: `${req.protocol}://${req.get('host')}/api/v1/clickpay/callback`, // Your callback URL
          // return: `${req.protocol}://${req.get('host')}/api/v1/clickpay/success?&packageId=${req.params.packageId}&providerWorkShopId=${req.body.providerWorkShopId as string}&couponCode=${req.query.couponCode as string}&amountPaid=${toBePaidAmount}&contact=${(req.user as any)?.contact}&vatPercent=${vatPercent}&flatDiscountedAmount=${flatDiscountedAmount}&flatVatAmount=${flatVatAmount}`, // Customer return URL
          // return: `${req.protocol}://${req.get('host')}/api/v1/clickpay/return`, // Customer return URL
          return: `https://senaeya.net/`, // Customer return URL
          return_using_get: true,
          user_defined: {
               packageId: req.params.packageId,
               providerWorkShopId: req.body.providerWorkShopId as string,
               couponCode: req.query.couponCode as string,
               amountPaid: toBePaidAmount.toString(),
               contact: (req.user as any)?.contact || '',
               vatPercent: vatPercent.toString(),
               flatDiscountedAmount: flatDiscountedAmount.toString(),
               flatVatAmount: flatVatAmount.toString(),
          },
          // user_defined: {
          //      udf1: ['packageId', req.params.packageId],
          //      udf2: ['providerWorkShopId', req.body.providerWorkShopId as string],
          //      udf3: ['couponCode', req.query.couponCode as string],
          //      udf4: ['amountPaid', toBePaidAmount.toString()],
          //      udf5: ['contact', (req.user as any)?.contact || ''],
          //      udf6: ['vatPercent', vatPercent.toString()],
          //      udf7: ['flatDiscountedAmount', flatDiscountedAmount.toString()],
          //      udf8: ['flatVatAmount', flatVatAmount.toString()],
          // },
     };
     const result = await initiatePaymentService(paymentRequest);
     console.log('🚀 ~ result:', result);

     if (result && result.redirect_url) {
          // Redirect user to ClickPay's hosted page
          //   res.redirect(303, result.redirect_url);
          sendResponse(res, {
               statusCode: 200,
               success: true,
               message: 'Payment initiation successful',
               data: result,
          });
     } else if (result && result.transaction_status) {
          // Rare direct success
          res.json({ success: true, transactionId: result.payment_gateway_reference });
     } else {
          res.status(400).json({ error: 'Payment initiation failed' });
     }
});

const paymentCallback = catchAsync(async (req, res) => {
     console.log('Current time callback:', new Date().toISOString());
     const { user_defined } = req.body;

     // Verify the callback (ClickPay may provide a signature; check docs for validation)
     console.log(`Payment Callback: Order ${user_defined}`);

     // Update your database: e.g., mark order as paid if status === 'success'
     // Example: await updateOrderStatus(cart_id, transaction_status);

     // Always respond with 200/201 to acknowledge
     res.status(200).send('OK');
});

export const clickpayController = {
     initiatePayment,
     paymentCallback,
};
