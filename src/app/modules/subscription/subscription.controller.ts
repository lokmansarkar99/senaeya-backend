import catchAsync from '../../../shared/catchAsync';
import { SubscriptionService } from './subscription.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const subscriptions = catchAsync(async (req, res) => {
     const result = await SubscriptionService.subscriptionsFromDB(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription list retrieved successfully',
          data: result,
     });
});

const subscriptionDetails = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await SubscriptionService.subscriptionDetailsFromDB(id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription details retrieved successfully',
          data: result.subscription,
     });
});

const cancelSubscription = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await SubscriptionService.cancelSubscriptionToDB(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Cancel subscription successfully',
          data: result,
     });
});
// create checkout session
const createCheckoutSession = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const packageId = req.params.id;
     const result = await SubscriptionService.createSubscriptionByPackageIdForWorkshop(id, packageId, req.query.amountPaid as string, req.query.couponCode as string, req.query.contact as string);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Create checkout session successfully',
          data: result,
     });
});
// update subscriptions
const updateSubscription = catchAsync(async (req, res) => {
     const subscriptionId = req.params.id;
     const result = await SubscriptionService.upgradeSubscriptionToDB(subscriptionId,req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Update checkout session successfully',
          data: result,
     });
});
const orderSuccess = catchAsync(async (req, res) => {
     const sessionId = req.query.session_id as string;
     const session = await SubscriptionService.successMessage(sessionId);
     res.render('success', { session });
});
// Assuming you have OrderServices imported properly
const orderCancel = catchAsync(async (req, res) => {
     res.render('cancel');
});

const deleteSubscriptionPackageToDB = catchAsync(async (req, res) => {
     const packageId = req.params.packageId;
     const result = await SubscriptionService.deleteSubscriptionPackageToDB(packageId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Delete subscription successfully',
          data: result,
     });
});

const getSubscriptionById = catchAsync(async (req, res) => {
     const subscriptionId = req.params.id;
     const result = await SubscriptionService.getSubscriptionByIdToDB(subscriptionId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Get subscription successfully',
          data: result,
     });
});
export const SubscriptionController = {
     subscriptions,
     subscriptionDetails,
     createCheckoutSession,
     updateSubscription,
     cancelSubscription,
     orderSuccess,
     orderCancel,
     deleteSubscriptionPackageToDB,
     getSubscriptionById
};
