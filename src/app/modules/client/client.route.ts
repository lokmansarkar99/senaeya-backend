import express from 'express';
import { clientController } from './client.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { clientValidation } from './client.validation';
import { USER_ROLES } from '../../../enums/user';
import { carRoutes } from '../car/car.route';
import { invoiceRoutes } from '../invoice/invoice.route';
import { carBrandRoutes } from '../carBrand/carBrand.route';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.use('/cars', carRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/car-brands', carBrandRoutes);
router.post(
     '/',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     // fileUploadHandler(),
     // parseFileData(FOLDER_NAMES.DOCUMENT),
     validateUserAuthority(),
     validateRequest(clientValidation.createClientZodSchema),
     clientController.createClient,
);

router.get('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.getAllClients);

router.get('/unpaginated', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.getAllUnpaginatedClients);

router.delete('/hard-delete/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.hardDeleteClient);

router.get('/client-by-contact/:contact', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.getClientByClientContact);
// TOGGLE CLIENT STATUS
router.patch(
     '/toggle-status/:id',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     validateUserAuthority(),
     validateRequest(clientValidation.toggleClientStatusZodSchema),
     clientController.toggleClientStatus,
);
// send message to recieve car
router.post(
     '/send-message-to-recieve-car/:id',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     validateUserAuthority(),
     clientController.sendMessageToRecieveCar,
);

router.get('/clients-by-carNumber/:carNumber', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.getClienstByCarNumber);
router.patch(
     '/:id',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     // fileUploadHandler(),
     // parseFileData(FOLDER_NAMES.DOCUMENT),
     validateUserAuthority(),
     validateRequest(clientValidation.updateClientZodSchema),
     clientController.updateClient,
);

router.delete('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.deleteClient);

router.get('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), clientController.getClientById);

export const clientRoutes = router;
