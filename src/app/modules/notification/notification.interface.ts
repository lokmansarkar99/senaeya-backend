import { Types } from 'mongoose';

export interface INotification {
     title?: string;
     message: string;
     message_ar?: string;
     message_bn?: string;
     message_tl?: string;
     message_hi?: string;
     message_ur?: string;
     receiver: Types.ObjectId;
     reference?: string;
     referenceModel?: 'Payment' | 'Order' | 'Message';
     screen?: 'DASHBOARD' | 'PAYMENT_HISTORY' | 'PROFILE';
     read: boolean;
     type?: 'ADMIN' | 'SYSTEM' | 'PAYMENT' | 'MESSAGE' | 'ALERT';
}
