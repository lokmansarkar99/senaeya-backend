import express from 'express';
import { DeviceTokenController } from './DeviceToken.controller';

const router = express.Router();

router.post('/', DeviceTokenController.createDeviceToken);

router.get('/', DeviceTokenController.getAllDeviceTokens);

router.get('/unpaginated', DeviceTokenController.getAllUnpaginatedDeviceTokens);

router.delete('/hard-delete/:id', DeviceTokenController.hardDeleteDeviceToken);

router.patch('/:id', DeviceTokenController.updateDeviceToken);

router.delete('/:id', DeviceTokenController.deleteDeviceToken);

router.get('/:id', DeviceTokenController.getDeviceTokenById);

export const DeviceTokenRoutes = router;
