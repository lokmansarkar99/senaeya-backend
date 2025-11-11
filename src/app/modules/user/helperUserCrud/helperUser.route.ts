import express from 'express';
import validateRequest from '../../../middleware/validateRequest';
import { HelperUserController } from './helperUser.controller';
import { HelperUserValidation } from './helperUser.validation';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = express.Router();


router.route('/add-remove-edit').patch(auth(USER_ROLES.WORKSHOP_OWNER),validateRequest(HelperUserValidation.addRemoveEditHelperUserZodSchema), HelperUserController.addRemoveEditHelperUserZodSchema);

export const HelperUserRouter = router;
