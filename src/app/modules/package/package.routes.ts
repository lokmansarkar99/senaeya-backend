import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { PackageController } from './package.controller';
import { PackageValidation } from './package.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';

const router = express.Router();

router
     .route('/')
     .get(PackageController.getPackage)
     .post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(PackageValidation.createPackageZodSchema), PackageController.createPackage)
router.get('/users', auth(USER_ROLES.WORKSHOP_OWNER), PackageController.getPackageByUser);
router.route('/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PackageController.updatePackage).delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PackageController.deletePackage);
router.get('/:id', PackageController.getPackageById);

export const PackageRoutes = router;
