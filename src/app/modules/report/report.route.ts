import express from 'express';
import { reportController } from './report.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';
import validateRequest from '../../middleware/validateRequest';
import { reportValidation } from './report.validation';

const router = express.Router();

router.get('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER),validateRequest(reportValidation.getAllReportsByCreatedDateRangeZodSchema), validateUserAuthority(), reportController.getAllReportsByCreatedDateRange);
router.get('/dashboard', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),reportController.getDashboardReport);

export const reportRoutes = router;
