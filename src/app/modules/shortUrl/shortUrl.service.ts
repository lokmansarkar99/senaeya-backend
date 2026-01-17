import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IshortUrl } from './shortUrl.interface';
import { ShortUrl } from './shortUrl.model';

const createShortUrl = async (payload: { shortUrl: string }): Promise<IshortUrl> => {
     const isExist = await ShortUrl.findOne({ shortUrl: payload.shortUrl });
     if (isExist) {
          return isExist;
     }
     const result = await ShortUrl.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ShortUrl not found.');
     }
     return result;
};

const getShortUrlByShortUrl = async (shortUrl: string): Promise<IshortUrl | null> => {
     const result = await ShortUrl.findOne({ shortUrl });
     return result;
};

export const shortUrlService = {
     createShortUrl,
     getShortUrlByShortUrl,
};
