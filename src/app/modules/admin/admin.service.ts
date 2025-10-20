import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { Subscription } from '../subscription/subscription.model';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {
     const createAdmin: any = await User.create(payload);
     if (!createAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
     }
     if (createAdmin) {
          await User.findByIdAndUpdate({ _id: createAdmin?._id }, { verified: true }, { new: true });
     }
     return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
     const isExistAdmin = await User.findByIdAndDelete(id);
     if (!isExistAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
     }
     return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
     const admins = await User.find({ role: 'ADMIN' }).select('name email profile contact location');
     return admins;
};

// need route for for dashboard on no of workshops subscribed, amont earned from subscription with "?month=10&year=2025"
const getDashboard = async (query: any): Promise<any> => {
     const rawMonth = query?.month;
     const rawYear = query?.year;

     let start: Date;
     let end: Date;

     // If either month or year is provided, require both to be valid
     if (rawMonth !== undefined || rawYear !== undefined) {
          const month = Number(rawMonth);
          const year = Number(rawYear);
          const validMonth = Number.isInteger(month) && month >= 1 && month <= 12;
          const validYear = Number.isInteger(year) && year >= 1970 && year <= 9999;

          if (!validMonth || !validYear) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid month/year');
          }
          start = new Date(year, month - 1, 1);
          end = new Date(year, month, 1);
     } else {
          const now = new Date();
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
     }

     const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

     const [subAgg] = await Subscription.aggregate([
          { $match: { createdAt: { $gte: start, $lt: end } } },
          {
               $group: {
                    _id: null,
                    subscriptionsCount: { $sum: 1 },
                    amountEarned: { $sum: '$price' },
                    workshopsSet: { $addToSet: '$workshop' },
               },
          },
          {
               $project: {
                    _id: 0,
                    subscriptionsCount: 1,
                    amountEarned: 1,
                    workshopsSubscribedCount: { $size: '$workshopsSet' },
               },
          },
     ]);

     return {
          totalAdmins,
          period: {
               month: start.getMonth() + 1,
               year: start.getFullYear(),
               start,
               end,
          },
          subscriptions: {
               subscriptionsCount: subAgg?.subscriptionsCount || 0,
               workshopsSubscribedCount: subAgg?.workshopsSubscribedCount || 0,
               amountEarned: subAgg?.amountEarned || 0,
          },
     };
};

export const AdminService = {
     createAdminToDB,
     deleteAdminFromDB,
     getAdminFromDB,
     getDashboard,
};
