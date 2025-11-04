import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { settingsController } from './settings.controller';
import auth from '../../middleware/auth';
import validateUserAuthority from '../../middleware/validateUserAuthority';
import { settingsValidation } from './settings.validation';
import validateRequest from '../../middleware/validateRequest';

const SettingsRouter = express.Router();

SettingsRouter.put(
     '/workshop-setting',
     auth(USER_ROLES.WORKSHOP_OWNER),
     validateUserAuthority(),
     validateRequest(settingsValidation.createUpdateSettingsZodSchemaForWorkshop),
     settingsController.addWorkshopSetting,
)
     .get(
          '/workshop-setting',
          auth(USER_ROLES.WORKSHOP_OWNER),
          validateUserAuthority(),
          settingsController.getWorkshopSetting,
     )
     .put('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsValidation.createUpdateSettingsZodSchemaForApp), settingsController.addSetting)
     .get('/', settingsController.getSettings)
     .get('/privacy-policy', settingsController.getPrivacyPolicy)
     .get('/app-explain', settingsController.getAppExplain)
     .get('/aboutus', settingsController.getAboutUs)
     .get('/support', settingsController.getSupport)
     .get('/termsOfService', settingsController.getTermsOfService);

export default SettingsRouter;
