import express from 'express';
import { messageController } from './message.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { messageValidation } from './message.validation';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.post('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(messageValidation.createMessageZodSchema), messageController.createMessage);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), messageController.getAllMessages);

router.get('/unpaginated', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), messageController.getAllUnpaginatedMessages);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), messageController.hardDeleteMessage);

// router.patch('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
//     validateRequest(messageValidation.updateMessageZodSchema), messageController.updateMessage);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), messageController.deleteMessage);

router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), messageController.getMessageById);

export const messageRoutes = router;
