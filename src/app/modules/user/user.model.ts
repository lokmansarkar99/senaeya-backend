import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { IUser, UserModel } from './user.interface';
import { Client } from '../client/client.model';

const userSchema = new Schema<IUser, UserModel>(
     {
          name: {
               type: String,
               required: false,
          },
          role: {
               type: String,
               enum: Object.values(USER_ROLES),
               default: USER_ROLES.WORKSHOP_OWNER,
          },
          providerWorkShopId: {
               type: Types.ObjectId,
               ref: 'Workshop',
               required: function (this: IUser) {
                    return this.role === USER_ROLES.CLIENT;
               },
          },
          email: {
               type: String,
               required: false,
               // unique: true,
               lowercase: true,
          },
          contact: {
               type: String,
               required: true,
               index: true,
               // unique: true,
          },
          nationality: {
               type: String,
               required: false,
          },
          preferredLanguage: {
               type: String,
               enum: ['en', 'bn', 'ar', 'ur', 'hi', 'tl'],
          },
          password: {
               type: String,
               // required: function () {
               //      // Password is only required for non-OAuth users
               //      return !this.oauthProvider;
               // },
               required: false,
               select: false,
               minlength: 8,
          },
          image: {
               type: String,
               default: '',
          },
          status: {
               type: String,
               enum: ['active', 'blocked'],
               default: 'active',
          },
          verified: {
               type: Boolean,
               default: true,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          stripeCustomerId: {
               type: String,
               default: '',
          },
          // OAuth fields
          googleId: {
               type: String,
               sparse: true,
          },
          facebookId: {
               type: String,
               sparse: true,
          },
          oauthProvider: {
               type: String,
               enum: ['google', 'facebook'],
          },
          authentication: {
               type: {
                    isResetPassword: {
                         type: Boolean,
                         default: false,
                    },
                    oneTimeCode: {
                         type: Number,
                         default: null,
                    },
                    expireAt: {
                         type: Date,
                         default: null,
                    },
               },
               select: false,
          },
          helperUserId: {
               type: Types.ObjectId,
               ref: 'User',
               default: null,
          },
          fingerPrintId: {
               type: String,
          },
          deviceToken: {
               type: String,
          },
          fcmToken: {
               type: String,
          },
     },
     { timestamps: true },
);

// Exist User Check
userSchema.statics.isExistUserById = async (id: string) => {
     return await User.findById(id);
};

// db.users.updateOne({email:"tihow91361@linxues.com"},{email:"rakibhassan305@gmail.com"})

userSchema.statics.isExistUserByEmail = async (email: string) => {
     return await User.findOne({ email });
};
userSchema.statics.isExistUserByContact = async (contact: string) => {
     return await User.findOne({ contact });
};
// Password Matching
userSchema.statics.isMatchPassword = async (password: string, hashPassword: string): Promise<boolean> => {
     return await bcrypt.compare(password, hashPassword);
};

// Pre-Save Hook for Hashing Password & Checking contact Uniqueness
userSchema.pre('save', async function (next) {
     // // Only check email uniqueness if this is a new user or email is being changed
     // if (this.isNew || this.isModified('contact')) {
     //      const existingUser = await User.findOne({ contact: this.get('contact') });
     //      if (existingUser && existingUser._id.toString() !== this._id.toString()) {
     //           throw new AppError(StatusCodes.BAD_REQUEST, 'contact already exists!');
     //      }
     // }

     // Only hash password if it's provided and modified
     if (this.password && this.isModified('password')) {
          this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
     }

     // Auto-verify OAuth users
     if (this.oauthProvider && !this.verified) {
          this.verified = true;
     }

     next();
});

userSchema.pre('save', async function (next) {
     const clientDetails = await Client.findOne({ clientId: this._id });

     if (clientDetails?.contact !== this.contact) {
          clientDetails?.contact === this.contact;
          await clientDetails?.save();
     }

     next();
});

// Query Middleware
userSchema.pre('find', function (next) {
     // Skip the filter if it's a login attempt
     if (this.getFilter().contact) {
          return next();
     }

     this.find({ isDeleted: { $ne: true } });
     next();
});

userSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

userSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});
export const User = model<IUser, UserModel>('User', userSchema);
