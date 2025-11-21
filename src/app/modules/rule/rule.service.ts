import { StatusCodes } from 'http-status-codes';
import { IRule } from './rule.interface';
import { Rule } from './rule.model';
import AppError from '../../../errors/AppError';

//privacy policy
const createPrivacyPolicyToDB = async (payload: IRule) => {
     // check if privacy policy exist or not
     const isExistPrivacy = await Rule.findOne({ type: 'privacy' });

     if (isExistPrivacy) {
          // update privacy is exist
          const result = await Rule.findOneAndUpdate({ type: 'privacy' }, { content: payload?.content }, { new: true });
          const message = 'Privacy & Policy Updated successfully';
          return { message, result };
     } else {
          // create new if not exist
          const result = await Rule.create({ ...payload, type: 'privacy' });
          const message = 'Privacy & Policy Created successfully';
          return { message, result };
     }
};

const getPrivacyPolicyFromDB = async () => {
     const result = await Rule.findOne({ type: 'privacy' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Privacy policy doesn't exist!");
     }
     return result;
};

//terms and conditions
const createTermsAndConditionToDB = async (payload: IRule) => {
     const isExistTerms = await Rule.findOne({ type: 'terms' });
     if (isExistTerms) {
          const result = await Rule.findOneAndUpdate({ type: 'terms' }, { content: payload?.content }, { new: true });
          const message = 'Terms And Condition Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ ...payload, type: 'terms' });
          const message = 'Terms And Condition Created Successfully';
          return { message, result };
     }
};

const getTermsAndConditionFromDB = async () => {
     const result = await Rule.findOne({ type: 'terms' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Terms and conditions doesn't  exist!");
     }
     return result;
};

//privacy policy
const createAboutToDB = async (payload: IRule) => {
     const isExistAbout = await Rule.findOne({ type: 'about' });
     if (isExistAbout) {
          const result = await Rule.findOneAndUpdate({ type: 'about' }, { content: payload?.content }, { new: true });
          const message = 'About Us Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ ...payload, type: 'about' });
          const message = 'About Us created successfully';
          return { message, result };
     }
};

const getAboutFromDB = async () => {
     const result = await Rule.findOne({ type: 'about' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "About doesn't exist!");
     }
     return result;
};

//  support and appExplain service
const createSupportToDB = async (payload: IRule) => {
     const isExistSupport = await Rule.findOne({ type: 'support' });
     if (isExistSupport) {
          const result = await Rule.findOneAndUpdate({ type: 'support' }, { content: payload?.content }, { new: true });
          const message = 'Support Content Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ ...payload, type: 'support' });
          const message = 'Support Content Created successfully';
          return { message, result };
     }
};

const getSupportFromDB = async () => {
     const result = await Rule.findOne({ type: 'support' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Support content doesn't exist!");
     }
     return result;
};

const createAppExplainToDB = async (payload: IRule) => {
     const isExistAppExplain = await Rule.findOne({ type: 'appExplain' });
     if (isExistAppExplain) {
          const result = await Rule.findOneAndUpdate({ type: 'appExplain' }, { content: payload?.content }, { new: true });
          const message = 'App Explain Content Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ ...payload, type: 'appExplain' });
          const message = 'App Explain Content Created successfully';
          return { message, result };
     }
};

const getAppExplainFromDB = async () => {
     const result = await Rule.findOne({ type: 'appExplain' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "App Explain content doesn't exist!");
     }
     return result;
};

// make resonable controller for allowedInvoicesCountForFreeUsers and defaultVat separetedly
const createAllowedInvoicesCountForFreeUsersToDB = async (value: IRule) => {
     const isExist = await Rule.findOne({ type: 'allowedInvoicesCountForFreeUsers' });
     if (isExist) {
          const result = await Rule.findOneAndUpdate({ type: 'allowedInvoicesCountForFreeUsers' }, { value }, { new: true });
          const message = 'Allowed Invoices Count For Free Users Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ value, type: 'allowedInvoicesCountForFreeUsers' });
          const message = 'Allowed Invoices Count For Free Users Created successfully';
          return { message, result };
     }
};

const getAllowedInvoicesCountForFreeUsersFromDB = async () => {
     const result = await Rule.findOne({ type: 'allowedInvoicesCountForFreeUsers' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Allowed Invoices Count For Free Users content doesn't exist!");
     }
     return result;
};

const createDefaultVatToDB = async (value: IRule) => {
     const isExist = await Rule.findOne({ type: 'defaultVat' });
     if (isExist) {
          const result = await Rule.findOneAndUpdate({ type: 'defaultVat' }, { value }, { new: true });
          const message = 'Default VAT Updated successfully';
          return { message, result };
     } else {
          const result = await Rule.create({ value, type: 'defaultVat' });
          const message = 'Default VAT Created successfully';
          return { message, result };
     }
};

const getDefaultVatFromDB = async () => {
     const result = await Rule.findOne({ type: 'defaultVat' });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Default VAT content doesn't exist!");
     }
     return result;
};

export const RuleService = {
     createPrivacyPolicyToDB,
     getPrivacyPolicyFromDB,
     createTermsAndConditionToDB,
     getTermsAndConditionFromDB,
     createAboutToDB,
     getAboutFromDB,
     createSupportToDB,
     getSupportFromDB,
     createAppExplainToDB,
     getAppExplainFromDB,
     createAllowedInvoicesCountForFreeUsersToDB,
     getAllowedInvoicesCountForFreeUsersFromDB,
     createDefaultVatToDB,
     getDefaultVatFromDB,
};
