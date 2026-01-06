import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Imessage } from './message.interface';
import { Message } from './message.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { MessageStatus } from './message.enum';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { User } from '../user/user.model';

const createMessage = async (payload: Imessage, user?: any): Promise<Imessage> => {
     // payload.contact = user.contact;
     const result = await Message.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found.');
     }
     return result;
};

const getAllMessages = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: Imessage[] }> => {
     const queryBuilder = new QueryBuilder(Message.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedMessages = async (): Promise<Imessage[]> => {
     const result = await Message.find();
     return result;
};

const updateMessage = async (id: string, payload: Partial<Imessage>): Promise<Imessage | null> => {
     const isExist = await Message.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found.');
     }

     const updatedMessage = await Message.findByIdAndUpdate(id, payload, { new: true });
     if (!updatedMessage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found.');
     }
     if (payload.status === MessageStatus.CLOSED) {
          // send message to whats app
          await whatsAppHelper.sendWhatsAppTextMessage({ to: updatedMessage.contact, body: `Your message was successfully completed.` });
     }

     return updatedMessage;
};

const deleteMessage = async (id: string): Promise<Imessage | null> => {
     const result = await Message.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteMessage = async (id: string): Promise<Imessage | null> => {
     const result = await Message.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found.');
     }
     return result;
};

const getMessageById = async (id: string): Promise<Imessage | null> => {
     const result = await Message.findById(id);
     return result;
};

export const messageService = {
     createMessage,
     getAllMessages,
     getAllUnpaginatedMessages,
     updateMessage,
     deleteMessage,
     hardDeleteMessage,
     getMessageById,
};
