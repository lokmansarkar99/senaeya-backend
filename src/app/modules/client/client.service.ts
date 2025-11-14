import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
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
import { CLIENT_STATUS, CLIENT_TYPE } from './client.enum';
import { IClient } from './client.interface';
import { Client } from './client.model';

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
               let isExistUser = await User.isExistUserByContact(payload.contact);
               if (!isExistUser) {
                    [isExistUser] = await User.create(
                         [
                              {
                                   name: payload.name,
                                   contact: payload.contact,
                                   role: USER_ROLES.CLIENT,
                                   password: config.user.password,
                              },
                         ],
                         { session },
                    );
                    if (!isExistUser) {
                         throw new AppError(StatusCodes.NOT_FOUND, 'User creation failed.');
                    }
               }
               console.log('🚀 ~ createClient ~ isExistUser:', isExistUser);
               let isExistClient = await Client.findOne({ clientId: isExistUser._id, clientType: CLIENT_TYPE.USER });
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
                         throw new AppError(StatusCodes.NOT_FOUND, 'Client creation failed.');
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
               console.log('🚀 ~ createClient ~ error:', error);
               // Abort the transaction on error
               await session.abortTransaction();
               session.endSession();

               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Client not created..');
          }
     }
};

const getAllClients = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IClient[] }> => {
     const queryBuilder = new QueryBuilder(Client.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().search(['contact']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedClients = async (): Promise<IClient[]> => {
     const result = await Client.find();
     return result;
};

const updateClient = async (id: string, payload: Partial<IClient>): Promise<IClient | null> => {
     const isExist = await Client.findOne({ _id: id });
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Client not found.1');
     }
     return await Client.findByIdAndUpdate(id, payload, { new: true });
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
