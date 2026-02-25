import express from 'express';
import { workShopController } from './workShop.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { workShopValidation } from './workShop.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.WORKSHOP_OWNER),
     fileUploadHandler(),
     parseFileData(FOLDER_NAMES.IMAGE),
     validateRequest(workShopValidation.createWorkShopZodSchema),
     workShopController.createWorkShop,
);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER), workShopController.getAllWorkShops);
router.get('/my', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), workShopController.getAllWorkShops);
router.get("/is-workshop", auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), workShopController.isWorkshop);

router.get('/unpaginated', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER), workShopController.getAllUnpaginatedWorkShops);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), workShopController.hardDeleteWorkShop);
router.get('/contact/:contact', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), workShopController.getWorkShopByContact);
router.get('/crn-mln-unn-tax', auth(USER_ROLES.WORKSHOP_OWNER), validateRequest(workShopValidation.getWorkShopBycrnMlnUnnTaxZodSchema), workShopController.getWorkShopBycrnMlnUnnTax);

router.patch(
     '/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER),
     fileUploadHandler(),
     parseFileData(FOLDER_NAMES.IMAGE),
     validateRequest(workShopValidation.updateWorkShopZodSchema),
     workShopController.updateWorkShop,
);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), workShopController.deleteWorkShop);

router.get('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), workShopController.getWorkShopById);

export const workShopRoutes = router;
