import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const pushNotificationToUserValidation = z.object({
     body: z.object({
          role: z.nativeEnum(USER_ROLES),
          title: z.string(),
          message: z.string(),
          type: z.enum(['ADMIN', 'SYSTEM', 'PAYMENT', 'MESSAGE', 'ALERT']),
          referenceModel: z.enum(['Payment', 'Order', 'Message']),
          reference: z.string(),
     }),
});


export const notificationValidation = {
    pushNotificationToUserValidation
};