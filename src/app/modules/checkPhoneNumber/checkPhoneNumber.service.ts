import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IcheckPhoneNumber } from './checkPhoneNumber.interface';
import { CheckPhoneNumber } from './checkPhoneNumber.model';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import generateOTP from '../../../utils/generateOTP';
import { CLIENT_STATUS } from '../client/client.enum';
import { Client } from '../client/client.model';
import { clientService } from '../client/client.service';

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
     const isAlreadyBlocked = await Client.findOne({ contact: payload.phoneNumber.trim() }).select('status');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'CheckPhoneNumber not found.');
     }
     return { message: 'otp sent successfully.', isAlreadyBlocked: isAlreadyBlocked?.status === CLIENT_STATUS.BLOCK };
};

const getCheckPhoneNumberByPhoneNumber = async (phoneNumber: string, otp: number) => {
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
