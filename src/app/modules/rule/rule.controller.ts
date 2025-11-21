import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RuleService } from './rule.service';

//privacy policy
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
     const { ...privacyData } = req.body;
     const result = await RuleService.createPrivacyPolicyToDB(privacyData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Privacy policy created successfully',
          data: result,
     });
});

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getPrivacyPolicyFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Privacy policy retrieved successfully',
          data: result,
     });
});

//terms and conditions
const createTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
     const { ...termsData } = req.body;
     const result = await RuleService.createTermsAndConditionToDB(termsData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Terms and conditions created successfully',
          data: result,
     });
});

const getTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getTermsAndConditionFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Terms and conditions retrieved successfully',
          data: result,
     });
});

//about
const createAbout = catchAsync(async (req: Request, res: Response) => {
     const { ...aboutData } = req.body;
     const result = await RuleService.createAboutToDB(aboutData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'About created successfully',
          data: result,
     });
});

const getAbout = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getAboutFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'About retrieved successfully',
          data: result,
     });
});

// support and appExplain controller
const createSupport = catchAsync(async (req: Request, res: Response) => {
     const { ...supportData } = req.body;
     const result = await RuleService.createSupportToDB(supportData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Support content created successfully',
          data: result,
     });
});

const getSupport = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getSupportFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Support content retrieved successfully',
          data: result,
     });
});
const createAppExplain = catchAsync(async (req: Request, res: Response) => {
     const { ...appExplainData } = req.body;
     const result = await RuleService.createAppExplainToDB(appExplainData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'App explanation created successfully',
          data: result,
     });
});

const getAppExplain = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getAppExplainFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'App explanation retrieved successfully',
          data: result,
     });
});
// make resonable valdiaiton for allowedInvoicesCountForFreeUsers and defaultVat separetedly
const createAllowedInvoicesCountForFreeUsers = catchAsync(async (req: Request, res: Response) => {
     const { value } = req.body;
     const result = await RuleService.createAllowedInvoicesCountForFreeUsersToDB(value);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Allowed invoices count for free users created successfully',
          data: result,
     });
});

const getAllowedInvoicesCountForFreeUsers = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getAllowedInvoicesCountForFreeUsersFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Allowed invoices count for free users retrieved successfully',
          data: result,
     });
});

const createDefaultVat = catchAsync(async (req: Request, res: Response) => {
     const { value } = req.body;
     const result = await RuleService.createDefaultVatToDB(value);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Default VAT created successfully',
          data: result,
     });
});

const getDefaultVat = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getDefaultVatFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Default VAT retrieved successfully',
          data: result,
     });
});

const createSocialMedia = catchAsync(async (req: Request, res: Response) => {
     const { ...socialMediaData } = req.body;
     const result = await RuleService.createSocialMediaToDB(socialMediaData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Social media link created successfully',
          data: result,
     });
});

const getSocialMedia = catchAsync(async (req: Request, res: Response) => {
     const result = await RuleService.getSocialMediaFromDB();

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Social media links retrieved successfully',
          data: result,
     });
});

export const RuleController = {
     createPrivacyPolicy,
     getPrivacyPolicy,
     createTermsAndCondition,
     getTermsAndCondition,
     createAbout,
     getAbout,
     createSupport,
     getSupport,
     createAppExplain,
     getAppExplain,
     createDefaultVat,
     getDefaultVat,
     createAllowedInvoicesCountForFreeUsers,
     getAllowedInvoicesCountForFreeUsers,
     createSocialMedia,
     getSocialMedia,
};







