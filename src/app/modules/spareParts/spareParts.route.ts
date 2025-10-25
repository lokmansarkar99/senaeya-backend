import express from 'express';
import { sparePartsController } from './spareParts.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { sparePartsValidation } from './spareParts.validation';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER),
     validateRequest(sparePartsValidation.createSparePartsZodSchema),
     validateUserAuthority(),
     sparePartsController.createSpareParts,
);

router.post(
     '/xlxs',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER),
     fileUploadHandler(),
     parseFileData(FOLDER_NAMES.DOCUMENT),
     validateUserAuthority(),
     sparePartsController.createManySparePartsByXLXS,
);

// createmanyspareparts
router.post(
     '/create-many',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER),
     validateUserAuthority(),
     sparePartsController.createManySpareParts,
);

router.get('/', sparePartsController.getAllSpareParts);

router.get('/unpaginated', sparePartsController.getAllUnpaginatedSpareParts);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), sparePartsController.hardDeleteSpareParts);
router.get('/get-by-code/:code',  sparePartsController.getSparePartsByCode);

router.patch(
     '/:id',
     // fileUploadHandler(),
     // parseFileData(FOLDER_NAMES.DOCUMENT),
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER),
     validateRequest(sparePartsValidation.updateSparePartsZodSchema),
     validateUserAuthority(),
     sparePartsController.updateSpareParts,
);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), sparePartsController.deleteSpareParts);

router.get('/:id',  sparePartsController.getSparePartsById);

export const sparePartsRoutes = router;
