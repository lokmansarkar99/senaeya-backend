import express from 'express';
import { checkPhoneNumberController } from './checkPhoneNumber.controller';
import validateRequest from '../../middleware/validateRequest';
import { checkPhoneNumberValidation } from './checkPhoneNumber.validation';

const router = express.Router();

router.post('/', validateRequest(checkPhoneNumberValidation.createCheckPhoneNumberZodSchema), checkPhoneNumberController.createCheckPhoneNumber);

router.patch('/:phoneNumber', validateRequest(checkPhoneNumberValidation.verifyPhoneNumber), checkPhoneNumberController.getCheckPhoneNumberByPhoneNumber);

export const checkPhoneNumberRoutes = router;
