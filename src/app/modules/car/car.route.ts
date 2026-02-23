import express from 'express';
import { carController } from './car.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { carValidation } from './car.validation';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.post('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(carValidation.createCarZodSchema), carController.createCar);

router.get('/provider', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN), validateUserAuthority(), carController.getAllCarsWithProvider);

router.get('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN), validateUserAuthority(), carController.getAllCars);

router.get('/admin', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN), validateUserAuthority(), carController.getAllCarsForAdmin);

router.get('/unpaginated', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), carController.getAllUnpaginatedCars);

router.delete('/hard-delete/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), carController.hardDeleteCar);

router.patch(
     '/:id',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     // validateUserAuthority(),
     validateRequest(carValidation.updateCarZodSchema),
     carController.updateCar,
);
router.delete('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), carController.deleteCar);

router.get('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateUserAuthority(), carController.getCarById);
// car    Routtes
export const carRoutes = router
