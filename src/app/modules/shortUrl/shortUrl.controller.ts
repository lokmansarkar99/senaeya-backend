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

const getShortUrlById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await shortUrlService.getShortUrlById(id);

     res.redirect(`${result?.shortUrl}`);
});

export const shortUrlController = {
     createShortUrl,
     getShortUrlById,
};
