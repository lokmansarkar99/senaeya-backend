import express from 'express';
import { invoiceController } from './invoice.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { invoiceValidation } from './invoice.validation';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     validateUserAuthority(),
     validateRequest(invoiceValidation.createInvoiceZodSchema),
     invoiceController.createInvoice,
);

router.get('/', invoiceController.getAllInvoices);
router.get('/provider', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), invoiceController.getAllInvoicesWithProvider);

router.get('/unpaginated', invoiceController.getAllUnpaginatedInvoices);

router.delete('/hard-delete/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), invoiceController.hardDeleteInvoice);
router.post('/release-invoice/:invoiceId', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(invoiceValidation.releaseInvoiceZodSchema), invoiceController.releaseInvoice);
router.post('/resend-invoice/:invoiceId', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(invoiceValidation.releaseInvoiceZodSchema), invoiceController.resendInvoice);

router.patch(
     '/:id',
     auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),
     validateUserAuthority(),
     validateRequest(invoiceValidation.updateInvoiceZodSchema),
     invoiceController.updateInvoice,
);

router.delete('/:id', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), invoiceController.deleteInvoice);

router.get('/:id([0-9a-fA-F]{24})', invoiceController.getInvoiceById);

export const invoiceRoutes = router;
