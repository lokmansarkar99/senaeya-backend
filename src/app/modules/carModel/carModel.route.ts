import express from 'express';
import { carModelController } from './carModel.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { carModelValidation } from './carModel.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(carModelValidation.createCarModelZodSchema), carModelController.createCarModel);

router.get('/', carModelController.getAllCarModels);

router.get('/unpaginated', carModelController.getAllUnpaginatedCarModels);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), carModelController.hardDeleteCarModel);

router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(carModelValidation.updateCarModelZodSchema), carModelController.updateCarModel);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), carModelController.deleteCarModel);

router.get('/:id', carModelController.getCarModelById);

export const carModelRoutes = router;
