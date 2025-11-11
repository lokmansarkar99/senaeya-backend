import AppError from '../../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user.model';
import { USER_ROLES } from '../../../../enums/user';
import mongoose from 'mongoose';

// update user by admin
const addRemoveEditHelperUserZodSchema = async (
     user: JwtPayload,
     payload: {
          type: string;
          contact: string;
          password?: string;
     },
) => {
     const isExistUser = await User.findById(user.id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     let isExistHelperUser = await User.findOne({ contact: payload.contact, role: USER_ROLES.WORKSHOP_MEMBER });
     if (!isExistHelperUser) {
          isExistHelperUser = await User.findOne({ contact: payload.contact, password: payload.password, role: USER_ROLES.WORKSHOP_MEMBER });
     }
     if (!isExistHelperUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Helper user not found');
     }

     if (isExistUser.role == USER_ROLES.WORKSHOP_OWNER) {
          if (isExistUser.helperUserId !== new mongoose.Types.ObjectId(isExistHelperUser._id)) {
               throw new AppError(StatusCodes.UNAUTHORIZED, 'Your helper user is not matched. You can not modify this helper user');
          }
     }

     if (payload.type == 'remove') {
          isExistUser.helperUserId = null;
     } else if (payload.type == 'edit' || payload.type == 'add') {
          isExistUser.helperUserId = new mongoose.Types.ObjectId(isExistHelperUser._id);
     }

     await isExistUser.save();
     return isExistHelperUser;
};

export const HelperUserService = {
     addRemoveEditHelperUserZodSchema,
};
