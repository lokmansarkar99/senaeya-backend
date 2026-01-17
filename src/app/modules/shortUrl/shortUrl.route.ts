import express from 'express';
import { shortUrlController } from './shortUrl.controller';

const router = express.Router();

router.post('/', shortUrlController.createShortUrl);

router.get('/:id', shortUrlController.getShortUrlById);

export const shortUrlRoutes = router;
