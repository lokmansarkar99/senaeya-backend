import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcheckPhoneNumber } from './checkPhoneNumber.interface';
import { CheckPhoneNumber } from './checkPhoneNumber.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import generateOTP from '../../../utils/generateOTP';

const createCheckPhoneNumber = async (payload: IcheckPhoneNumber) => {
     const isExistUnVerifiedCheckPhoneNumber = await CheckPhoneNumber.findOne({ phoneNumber: payload.phoneNumber.trim(), isVerified: false, otp: { $gt: 0 } });

     if (isExistUnVerifiedCheckPhoneNumber) {
          const values = {
               otp: Number(isExistUnVerifiedCheckPhoneNumber.otp),
               contact: isExistUnVerifiedCheckPhoneNumber.phoneNumber!,
          };
          const createAccountTemplate = whatsAppTemplate.createAccount(values);
          whatsAppHelper.sendWhatsAppTextMessage({
               to: payload.phoneNumber!,
               body: createAccountTemplate,
               priority: 10,
          });
          return { message: 'otp sent successfully.' };
     }

     //send email
     const otp = generateOTP(4);
     const values = {
          otp: otp,
          contact: payload.phoneNumber!,
     };
     let result;
     try {
          result = await CheckPhoneNumber.create({ phoneNumber: payload.phoneNumber.trim(), otp });
     } catch (error) {
          console.log('🚀 ~ createCheckPhoneNumber ~ error:', error);
     }
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }

     const createAccountTemplate = whatsAppTemplate.createAccount(values);
     whatsAppHelper.sendWhatsAppTextMessage({
          to: payload.phoneNumber!,
          body: createAccountTemplate,
          priority: 10,
     });
     return { message: 'otp sent successfully.' };
};

const getCheckPhoneNumberByPhoneNumber = async (phoneNumber: string, otp: number) => {
     const result = await CheckPhoneNumber.findOneAndUpdate({ phoneNumber: phoneNumber.trim(), otp: Number(otp) }, { isVerified: true }, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }
     return result;
};

const getIsPhoneNumberVerified = async (phoneNumber: string) => {
     const result = await CheckPhoneNumber.findOne({ phoneNumber, isVerified: true });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }
     return result.isVerified;
};

export const checkPhoneNumberService = {
     createCheckPhoneNumber,
     getCheckPhoneNumberByPhoneNumber,
     getIsPhoneNumberVerified,
};
