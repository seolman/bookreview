import { RequestHandler } from "express";

import { redis } from "../db/redis.js";
import {
  MyPaginationResponse,
  sendSuccessPagination,
} from "../utils/response.js";
import logger from "../utils/logger.js";

export const cacheMiddleware: RequestHandler = async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  try {
    const data = await redis.get(key);
    if (data) {
      const parsedData: MyPaginationResponse<any> = JSON.parse(data);
      return sendSuccessPagination(
        res,
        parsedData.data,
        parsedData.pagination,
        parsedData.code,
        parsedData.message
      );
    }

    logger.info(`Cache miss for key: ${key}`);

    const originalSend = res.send;
    res.send = function (body) {
      try {
        const bodyObj = JSON.parse(body);
        if (res.statusCode >= 200 && res.statusCode < 300 && bodyObj.success) {
          redis.setEx(key, 3600, JSON.stringify(bodyObj));
          logger.info(`Cached data for key: ${key}`);
        }
      } catch (err) {
        logger.error("Caching invalid data: ", err);
      }
      return originalSend.call(this, body);
    };
    next();
  } catch (err) {
    logger.error("Cache middleware error: ", err);
    next();
  }
};
