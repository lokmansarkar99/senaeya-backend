import express from 'express';
import { shortUrlController } from './shortUrl.controller';

const router = express.Router();

router.post('/', shortUrlController.createShortUrl);

router.get('/:shortUrl', shortUrlController.getShortUrlByShortUrl);

export const shortUrlRoutes = router;
