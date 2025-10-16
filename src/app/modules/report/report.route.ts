import express from 'express';
import { reportController } from './report.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.get('/', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), reportController.getAllReportsByCreatedDateRange);

export const reportRoutes = router;
