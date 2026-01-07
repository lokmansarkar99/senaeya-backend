import { StatusCodes } from 'http-status-codes';
import mongoose, { Types } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import QueryBuilder from '../../builder/QueryBuilder';
import { Car } from '../car/car.model';
import { carService } from '../car/car.service';
import { Invoice } from '../invoice/invoice.model';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { User } from '../user/user.model';
import { WorkShop } from '../workShop/workShop.model';
import { CLIENT_CAR_TYPE, CLIENT_STATUS, CLIENT_TYPE } from './client.enum';
import { IClient } from './client.interface';
import { Client } from './client.model';
import { CheckPhoneNumber } from '../checkPhoneNumber/checkPhoneNumber.model';
import { CarBrand } from '../carBrand/carBrand.model';
import { CarModel } from '../carModel/carModel.model';
import { ICar } from '../car/car.interface';

/** steps
 * client type check user or workshop
 *   if workshop
 *        is exist work shop id
 *             if workshop exist true
 *                  need workshop id
 *             if workshop not exist
 *                  throw error
 *   if client type is user
 *      check user exist or not
 *        if exist use that user id
 *             find client document by user id
 *             if client exist use that client id
 *                  push cars information
 *             if client not exist
 *                  create new client
 *      check car exist(by vin or plate number for international or plate number for saudi) or not
 *        if exist use that car id
 *        if not create new car
 * link the client vs user and client vs car relation
 */

const createClient = async (payload: any) => {
     // check is payload.contact is verified or not
     if (payload.contact) {
          const isVerifiedContact = await CheckPhoneNumber.findOne({ phoneNumber: payload.contact, isVerified: true });
          if (!isVerifiedContact) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User contact is not verified.');
          }
     }
     if (payload.clientType === CLIENT_TYPE.WORKSHOP) {
          let isExistClient = await Client.findOne({ workShopNameAsClient: payload.workShopNameAsClient, clientType: CLIENT_TYPE.WORKSHOP, providerWorkShopId: payload.providerWorkShopId });
          if (!isExistClient) {
               isExistClient = await Client.create({
                    clientType: payload.clientType,
                    workShopNameAsClient: payload.workShopNameAsClient,
                    documentNumber: payload.documentNumber || null,
                    providerWorkShopId: payload.providerWorkShopId,
                    contact: payload.contact,
               });
               if (!isExistClient) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Client creation failed.');
               }
               return isExistClient;
          }

          throw new AppError(StatusCodes.NOT_FOUND, 'Client already exist for you.....');
     } else if (payload.clientType === CLIENT_TYPE.USER) {
          // use mongoose transaction
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
               let isExistUser = await User.findOne({ contact: payload.contact, role: USER_ROLES.CLIENT, providerWorkShopId: payload.providerWorkShopId });
               if (!isExistUser) {
                    [isExistUser] = await User.create(
                         [
                              {
                                   name: payload.name,
                                   contact: payload.contact,
                                   role: USER_ROLES.CLIENT,
                                   password: config.user.password,
                                   providerWorkShopId: payload.providerWorkShopId,
                              },
                         ],
                         { session },
                    );
                    if (!isExistUser) {
                         throw new AppError(StatusCodes.NOT_FOUND, 'This number is already taken.');
                    }
               }
               let isExistClient = await Client.findOne({ clientId: isExistUser._id, clientType: CLIENT_TYPE.USER, providerWorkShopId: payload.providerWorkShopId });
               if (!isExistClient) {
                    [isExistClient] = await Client.create(
                         [
                              {
                                   clientType: payload.clientType,
                                   clientId: isExistUser._id,
                                   documentNumber: payload.documentNumber || null,
                                   providerWorkShopId: payload.providerWorkShopId,
                                   contact: payload.contact,
                              },
                         ],
                         { session },
                    );
                    if (!isExistClient) {
                         throw new AppError(StatusCodes.NOT_FOUND, 'This number is already taken.');
                    }
               }
               if (payload.vin) {
                    let isExistCar = await Car.findOne({ vin: payload.vin });
                    if (!isExistCar) {
                         isExistCar = await carService.createCarWithSession(
                              {
                                   client: isExistClient._id,
                                   brand: payload.brand,
                                   model: payload.model,
                                   year: payload.year,
                                   vin: payload.vin,
                                   carType: payload.carType,
                                   plateNumberForInternational: payload.plateNumberForInternational || null,
                                   plateNumberForSaudi: payload.plateNumberForSaudi || null,
                                   slugForSaudiCarPlateNumber: null,
                                   providerWorkShopId: payload.providerWorkShopId,
                              },
                              session,
                         );
                         if (!isExistCar) {
                              throw new AppError(StatusCodes.NOT_FOUND, 'Car creation failed.');
                         }
                    }
                    // link the client vs user and client vs car relation
                    isExistClient.cars.push(isExistCar._id);
               }
               await isExistClient.save({ session });
               await session.commitTransaction();
               session.endSession();
               return isExistClient;
          } catch (error) {
               // Abort the transaction on error
               await session.abortTransaction();
               session.endSession();

               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Client not created..');
          }
     }
};

const updateClientDuringCreate = async (
     user: any,
     payload: {
          providerWorkShopId: string;
          carId: string;
          clientId: string;
          clientType: CLIENT_TYPE;
          workShopNameAsClient?: string;
          brand?: string;
          model?: string;
          year?: string;
          vin?: string;
          name?: string;
          contact?: string;
          description?: string;
          documentNumber?: string;
          carType?: CLIENT_CAR_TYPE; // *
          plateNumberForInternational?: string; // *
          plateNumberForSaudi?: {
               // *
               symbol?: string;
               numberEnglish?: string;
               numberArabic?: string;
               alphabetsCombinations?: string[];
          };
     },
) => {
     console.log('🚀 ~ updateClientDuringCreate ~ payload:', payload);
     const isPhoneNumberTakenByOtherClientOfThisWorkshop = await Client.findOne({
          contact: payload.contact,
          // providerWorkShopId: new mongoose.Types.ObjectId(payload.providerWorkShopId),
     });
     console.log('🚀 ~ updateClientDuringCreate ~ isPhoneNumberTakenByOtherClientOfThisWorkshop:', isPhoneNumberTakenByOtherClientOfThisWorkshop);
     if (isPhoneNumberTakenByOtherClientOfThisWorkshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Mobile number already in use, enter another mobile number.');
     }
     throw new Error('tet');

     // check is payload.contact is verified or not
     if (payload.contact) {
          if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN) {
               const isVerifiedContact = await CheckPhoneNumber.findOne({ phoneNumber: payload.contact, isVerified: true });
               if (!isVerifiedContact) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'User contact is not verified.');
               }
          }

          // check is exist user or as client
          const isExistUser = await User.findOne({ contact: payload.contact, providerWorkShopId: payload.providerWorkShopId, role: USER_ROLES.CLIENT });
          if (isExistUser) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User already exists with this contact number.');
          }

          const isExistClient = await Client.findOne({ contact: payload.contact, providerWorkShopId: payload.providerWorkShopId });
          if (isExistClient) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Client already exists with this contact number.');
          }
     }
     if (payload.clientType === CLIENT_TYPE.WORKSHOP) {
          let isExistClient = await Client.findOne({ workShopNameAsClient: payload.workShopNameAsClient, clientType: CLIENT_TYPE.WORKSHOP, providerWorkShopId: payload.providerWorkShopId });
          if (!isExistClient) {
               isExistClient = await Client.create({
                    clientType: payload.clientType,
                    workShopNameAsClient: payload.workShopNameAsClient,
                    documentNumber: payload.documentNumber || null,
                    providerWorkShopId: payload.providerWorkShopId,
                    contact: payload.contact,
               });
               if (!isExistClient) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Client creation failed.');
               }
               return isExistClient;
          }

          throw new AppError(StatusCodes.NOT_FOUND, 'Client already exist for you.....');
     } else if (payload.clientType === CLIENT_TYPE.USER) {
          const isExistClient = await Client.findOne({ _id: new mongoose.Types.ObjectId(payload.clientId), clientType: CLIENT_TYPE.USER, providerWorkShopId: payload.providerWorkShopId });
          if (!isExistClient) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Client not found');
          }

          const userDetails = await User.findOne({ _id: isExistClient.clientId, providerWorkShopId: payload.providerWorkShopId, role: USER_ROLES.CLIENT });
          if (!userDetails) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
          }

          const isExistCar = await Car.findById(payload.carId);
          if (!isExistCar) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Car not found');
          }

          const isExistBrand = await CarBrand.findById(payload.brand);
          if (!isExistBrand) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found with provided ID: ' + payload.brand);
          }

          const isExistModel = await CarModel.findOne({
               _id: new mongoose.Types.ObjectId(payload.model),
               brand: new mongoose.Types.ObjectId(payload.brand),
          });
          if (!isExistModel) {
               throw new AppError(
                    StatusCodes.NOT_FOUND,
                    `Model not found with provided ID: '${payload.model}' for brand: '${payload.brand}' (${isExistBrand.title}) - Model ID: ${payload.model} - Brand ID: ${payload.brand}`,
               );
          }

          // use mongoose transaction
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
               // update user name
               if (payload.name && payload.name.trim() !== userDetails?.name?.trim()) {
                    userDetails.name = payload.name;
               }
               if (payload.contact && payload.contact.trim() !== userDetails?.contact?.trim()) {
                    userDetails.contact = payload.contact;
               }
               await userDetails.save({ session });
               // update client name
               if (payload.contact && payload.contact.trim() !== isExistClient.contact.trim()) {
                    isExistClient.contact = payload.contact;
               }
               if (payload.documentNumber && payload.documentNumber.trim() !== isExistClient.documentNumber?.trim()) {
                    isExistClient.documentNumber = payload.documentNumber;
               }
               await isExistClient.save({ session });
               // link the client vs user and client vs car relation
               if (payload.brand) {
                    isExistCar.brand = new Types.ObjectId(payload.brand!);
               }
               if (payload.model) {
                    (isExistCar as ICar).model = new Types.ObjectId(payload.model!);
               }
               if (payload.year) {
                    isExistCar.year = payload.year!.toString();
               }
               if (payload.vin) {
                    (isExistCar as ICar).vin = payload.vin;
               }
               if (payload.carType) {
                    if (payload.carType === CLIENT_CAR_TYPE.SAUDI && !payload.plateNumberForSaudi) {
                         if (JSON.stringify(payload.plateNumberForSaudi) !== JSON.stringify((isExistCar as ICar).plateNumberForSaudi)) {
                              (isExistCar as ICar).plateNumberForSaudi = payload.plateNumberForSaudi;
                         }
                         throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for Saudi is required');
                    }
                    if (payload.carType === CLIENT_CAR_TYPE.INTERNATIONAL && !payload.plateNumberForInternational) {
                         if (payload.plateNumberForInternational !== (isExistCar as ICar).plateNumberForInternational) {
                              (isExistCar as ICar).plateNumberForInternational = payload.plateNumberForInternational;
                         }
                         throw new AppError(StatusCodes.BAD_REQUEST, 'Plate number for International is required');
                    }
                    (isExistCar as ICar).carType = payload.carType;
               }
               await isExistCar.save({ session });
               await session.commitTransaction();
               session.endSession();
               return isExistClient;
          } catch (error) {
               console.log('🚀 ~ updateClientDuringCreate ~ error:', error);
               // Abort the transaction on error
               await session.abortTransaction();
               session.endSession();

               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Operation failed..');
          }
     }
};

const getAllClients = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IClient[] }> => {
     const queryBuilder = new QueryBuilder(Client.find().populate('clientId').populate('cars'), query);
     const result = await queryBuilder.filter().sort().paginate().fields().search(['contact']).modelQuery;

     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedClients = async (): Promise<IClient[]> => {
     const result = await Client.find();
     return result;
};

const updateClient = async (
     id: string,
     payload: {
          providerWorkShopId: string;
          carId: string;
          brand: Types.ObjectId;
          model: Types.ObjectId | any;
          year: string;
          vin: string;
          documentNumber: string;
          name: string;
          contact: string;
     },
) => {
     const isExistClient = await Client.findOne({ _id: id, providerWorkShopId: payload.providerWorkShopId, role: USER_ROLES.CLIENT });
     if (!isExistClient) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.1');
     }
     const isExistCar = await Car.findOne({ _id: payload.carId, providerWorkShopId: payload.providerWorkShopId });
     if (!isExistCar) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found.2');
     }

     const isExistClientInUser = await User.findOne({ _id: isExistClient.clientId });
     if (!isExistClientInUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.3');
     }

     const session = await mongoose.startSession();
     try {
          session.startTransaction();
          // ---- Updates ----
          payload.name && (isExistClientInUser.name = payload.name);
          payload.contact && (isExistClientInUser.contact = payload.contact);

          payload.contact && (isExistClient.contact = payload.contact);
          payload.documentNumber && (isExistClient.documentNumber = payload.documentNumber);

          payload.brand && (isExistCar.brand = payload.brand);
          payload.model && (isExistCar.model = payload.model);
          payload.year && (isExistCar.year = payload.year);
          payload.vin && (isExistCar.vin = payload.vin);

          // ---- Saves (IMPORTANT: pass session) ----
          await isExistClientInUser.save({ session });
          await isExistClient.save({ session });
          await isExistCar.save({ session });

          await session.commitTransaction();
          session.endSession();
          return isExistClient;
     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
};

const deleteClient = async (id: string): Promise<IClient | null> => {
     const result = await Client.findOne({ _id: id });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.2');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteClient = async (id: string): Promise<IClient | null> => {
     const result = await Client.findOneAndDelete({ _id: id });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.3');
     }
     return result;
};

const getClientById = async (id: string): Promise<IClient | null> => {
     const result = await Client.findOne({ _id: id });
     return result;
};

const getClientByClientContact = async (contact: string, providerWorkShopId: string) => {
     const client = await Client.findOne({ contact, providerWorkShopId }).populate('clientId', 'documentNumber workshopNameEnglish workshopNameArabic');
     if (!client) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.4');
     }

     // find expiredInvoices of the user
     const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
     const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

     const expiredPostpaidInvoices = await Invoice.find({
          client: client._id,
          paymentStatus: PaymentStatus.UNPAID,
          $or: [
               {
                    paymentType: PaymentMethod.POSTPAID,
                    postPaymentDate: { $lt: threeDaysAgo },
               },
               {
                    paymentType: { $ne: PaymentMethod.POSTPAID },
                    createdAt: { $lt: tenDaysAgo },
               },
          ],
     }).select('_id');

     if (expiredPostpaidInvoices.length > 0) {
          client.hasPaymentIssues = true;
          await client.save();
     } else {
          client.hasPaymentIssues = false;
          await client.save();
     }

     const carOfClient = await Car.findOne({ client: client._id })
          .populate({
               path: 'client',
               populate: {
                    path: 'clientId',
               },
          })
          .populate({
               path: 'model',
               select: 'title',
          })
          .populate({
               path: 'brand',
               select: '_id image title',
               populate: {
                    path: 'country',
                    select: '_id image title',
               },
          });
     // return [carOfClient,client];
     return carOfClient ? [carOfClient] : [client];
};

const toggleClientStatus = async (id: string): Promise<IClient | null> => {
     const [result] = await Client.find({ _id: id });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.5');
     }
     result.status = result.status === CLIENT_STATUS.ACTIVE ? CLIENT_STATUS.BLOCK : CLIENT_STATUS.ACTIVE;
     await result.save();
     const message = whatsAppTemplate.defaulterList({ status: result.status });
     await whatsAppHelper.sendWhatsAppTextMessage({ to: result.contact, body: message });
     return result;
};

const sendMessageToRecieveCar = async (id: string, providerWorkShopId: string) => {
     const [result] = await Client.find({ _id: id });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.6');
     }
     const workShop = await WorkShop.findById(providerWorkShopId).select('workshopNameEnglish workshopNameArabic');
     //send message
     const values = { contact: result.contact, workshopNameEnglish: workShop!.workshopNameEnglish, workshopNameArabic: workShop!.workshopNameArabic };
     const message = whatsAppTemplate.getRecieveCar(values);
     await whatsAppHelper.sendWhatsAppTextMessage({ to: result.contact, body: message });
};

const getClienstByCarNumber = async (carNumber: string) => {
     const isExistCarByNumber = await Car.findOne({
          $or: [{ plateNumberForInternational: carNumber }, { slugForSaudiCarPlateNumber: carNumber }],
     });
     if (!isExistCarByNumber) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Car not found');
     }
     const clients = await Client.find({ cars: { $in: [isExistCarByNumber._id] } }).populate('clientId', 'name');
     if (!clients) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found');
     }

     const allClientIds = clients.map((client) => client._id);
     // find expiredInvoices of the user
     const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
     const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

     const expiredPostpaidInvoices = await Invoice.find({
          client: { $in: allClientIds },
          paymentStatus: PaymentStatus.UNPAID,
          $or: [
               {
                    paymentType: PaymentMethod.POSTPAID,
                    postPaymentDate: { $lt: threeDaysAgo },
               },
               {
                    paymentType: { $ne: PaymentMethod.POSTPAID },
                    createdAt: { $lt: tenDaysAgo },
               },
          ],
     }).select('client');

     const clientIdsWithPaymentIssues = expiredPostpaidInvoices.map((invoice) => invoice.client);

     if (clientIdsWithPaymentIssues.length > 0) {
          // update manay allthe client to hasPaymentIssues true
          await Client.updateMany(
               { _id: { $in: clientIdsWithPaymentIssues } },
               {
                    $set: { hasPaymentIssues: true },
               },
          );
     } else {
          // update manay allthe client to hasPaymentIssues true
          await Client.updateMany(
               { _id: { $in: clientIdsWithPaymentIssues } },
               {
                    $set: { hasPaymentIssues: false },
               },
          );
     }

     return clients;
};

export const clientService = {
     createClient,
     updateClientDuringCreate,
     getAllClients,
     getAllUnpaginatedClients,
     updateClient,
     deleteClient,
     hardDeleteClient,
     getClientById,
     toggleClientStatus,
     sendMessageToRecieveCar,
     getClientByClientContact,
     getClienstByCarNumber,
};
