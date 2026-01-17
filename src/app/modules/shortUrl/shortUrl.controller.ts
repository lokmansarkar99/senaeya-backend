import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { shortUrlService } from './shortUrl.service';
import config from '../../../config';

const createShortUrl = catchAsync(async (req: Request, res: Response) => {
     const result = await shortUrlService.createShortUrl(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ShortUrl created successfully',
          data: result,
     });
});

const getShortUrlByShortUrl = catchAsync(async (req: Request, res: Response) => {
     const { shortUrl } = req.params;
     const result = await shortUrlService.getShortUrlByShortUrl(shortUrl);

     res.redirect(`${result?.shortUrl}`);
});

export const shortUrlController = {
     createShortUrl,
     getShortUrlByShortUrl,
};
