import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcheckPhoneNumber } from './checkPhoneNumber.interface';
import { CheckPhoneNumber } from './checkPhoneNumber.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import generateOTP from '../../../utils/generateOTP';

const createCheckPhoneNumber = async (payload: IcheckPhoneNumber) => {
     const isExistPhoneNumber = await CheckPhoneNumber.findOne({ phoneNumber: payload.phoneNumber.trim() });
     if (isExistPhoneNumber) {
          // delete old phone number
          await CheckPhoneNumber.deleteOne({ phoneNumber: payload.phoneNumber.trim() });
     }

     //send email
     const otp = generateOTP(4);
     const values = {
          otp: otp,
          contact: payload.phoneNumber!,
     };

     const createAccountTemplate = whatsAppTemplate.createAccount(values);
     whatsAppHelper.sendWhatsAppTextMessage({
          to: payload.phoneNumber!,
          body: createAccountTemplate,
          priority: 10,
     });

     const result = await CheckPhoneNumber.create({ phoneNumber: payload.phoneNumber.trim(), otp });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }
     return { message: 'otp sent successfully.' };
};

const getCheckPhoneNumberByPhoneNumber = async (phoneNumber: string, otp: number) => {
     console.log("🚀 ~ getCheckPhoneNumberByPhoneNumber ~ phoneNumber: string, otp: number:", phoneNumber, otp)
     const isExistPhoneNumber = await CheckPhoneNumber.findOne({ phoneNumber: phoneNumber.trim(), otp: Number(otp) });
     if (!isExistPhoneNumber) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found...*.');
     }

     const result = await CheckPhoneNumber.findOneAndUpdate({ phoneNumber: phoneNumber.trim(), otp: Number(otp) }, { isVerified: true }, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }
     return result;
};

export const checkPhoneNumberService = {
     createCheckPhoneNumber,
     getCheckPhoneNumberByPhoneNumber,
};
