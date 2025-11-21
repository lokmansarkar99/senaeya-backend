import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { RuleController } from './rule.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { RuleValidation } from './rule.validation';
const router = express.Router();

//about us
router.route('/about').post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createAbout).get(RuleController.getAbout);

//privacy policy
router.route('/privacy-policy').post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createPrivacyPolicy).get(RuleController.getPrivacyPolicy);

//terms and conditions
router.route('/terms-and-conditions').post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createTermsAndCondition).get(RuleController.getTermsAndCondition);

// appExplain route
router.route('/app-explain').post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createAppExplain).get(RuleController.getAppExplain);

// support
router.route('/support').post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createSupport).get(RuleController.getSupport);

// make resonable valdiaiton for allowedInvoicesCountForFreeUsers and defaultVat
router
     .route('/allowed-invoices-count-for-free-users')
     .post(validateRequest(RuleValidation.createAllowedInvoicesCountForFreeUsers), auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createAllowedInvoicesCountForFreeUsers)
     .get(RuleController.getAllowedInvoicesCountForFreeUsers);

router.route('/default-vat').post(validateRequest(RuleValidation.createDefaultVat), auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createDefaultVat).get(RuleController.getDefaultVat);

export const RuleRoute = router;
