import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
export type IUser = {
     name?: string;
     role: USER_ROLES;
     email?: string;
     contact: string;
     nationality?: string;
     preferredLanguage?: 'en' | 'bn' | 'ar' | 'ur' | 'hi' | 'tl';
     password?: string;
     image?: string;
     isDeleted: boolean;
     stripeCustomerId: string;
     status: 'active' | 'blocked';
     verified: boolean;
     googleId?: string;
     facebookId?: string;
     oauthProvider?: 'google' | 'facebook';
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode: number;
          expireAt: Date;
     };
     helperUserId?: Types.ObjectId | null;
     fingerPrintId?: string;
     deviceToken?: string;
     fcmToken?: string;
     providerWorkShopId?: Types.ObjectId | null;
};

export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isExistUserByContact(contact: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
