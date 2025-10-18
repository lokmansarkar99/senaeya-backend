import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { initiatePaymentService } from './clickpay.service';
import { CLICKPAY_CURRENCY } from './clickpay.interface';
import { TRAN_CLASS, TRAN_TYPE } from './clickpay.enum';
import { Package } from '../../package/package.model';
import { Subscription } from '../../subscription/subscription.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { SubscriptionService } from '../../subscription/subscription.service';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
     const isExistPackage = await Package.findById(req.params.packageId);
     if (!isExistPackage) {
          throw new Error('Package not found');
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

     const createdSubcription = await SubscriptionService.createSubscriptionByPackageIdForWorkshop(req.body.providerWorkShopId as string, req.params.packageId as string);
     if (!createdSubcription) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription creation failed');
     }

     const paymentRequest = {
          cart_amount: isExistPackage.price,
          cart_currency: CLICKPAY_CURRENCY,
          cart_description: isExistPackage.description || 'Order Payment',
          cart_id: isExistPackage._id.toString(),
          tran_type: TRAN_TYPE.SALE,
          tran_class: TRAN_CLASS.ECOM,
          callback: `${req.protocol}://${req.get('host')}/api/v1/clickpay/callback`, // Your callback URL
          return: `${req.protocol}://${req.get('host')}/api/v1/clickpay/success`, // Customer return URL
     };
     const result = await initiatePaymentService(paymentRequest);

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
     const { transaction_status, payment_gateway_reference, cart_id } = req.body;

     // Verify the callback (ClickPay may provide a signature; check docs for validation)
     console.log(`Payment Callback: Order ${cart_id} - Status: ${transaction_status}, Ref: ${payment_gateway_reference}`);

     // Update your database: e.g., mark order as paid if status === 'success'
     // Example: await updateOrderStatus(cart_id, transaction_status);

     // Always respond with 200/201 to acknowledge
     res.status(200).send('OK');
});

export const clickpayController = {
     initiatePayment,
     paymentCallback,
};
