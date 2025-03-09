import { redisClient } from '../configurations/config.js';
import { StatusCodes } from 'http-status-codes';
import { systemLogger } from '../utils/logger.js';

const cacheByIdMiddleware = (Model) => {
  return async (req, res, next) => {
    const id = req.params.id ? req.params.id : req.query.id;

    try {
      const cachedData = await redisClient.get(`${Model.modelName}:${id}`);

      if (cachedData) {
        systemLogger.info(`Data : ${cachedData} has been fetched from Redis`)
        
        return res.status(StatusCodes.OK).json({
          message: ` ${Model.modelName} Fetched Successfully From Cache`, 
          data: JSON.parse(cachedData) });
      }

      next();
    } catch (e) {
      systemLogger.error(`Error in caching middleware : ${e}`)
      next(e);
    }
  };
};

const cacheAllMiddleware = (Model) => {
  return async (req, res, next) => {
    try {
      const cachedData = await redisClient.get(`${Model.modelName}:all`);

      if (cachedData) {
        systemLogger.info(`Data : ${cachedData} has been fetched from Redis`)
        
        return res.status(StatusCodes.OK).json({
          message: ` ${Model.modelName} Fetched Successfully From Cache`, 
          data: JSON.parse(cachedData) });
      }

      next();
    } catch (e) {
      systemLogger.error(`Error in caching middleware : ${e}`)
      next(e);
    }
  };
};

export {cacheByIdMiddleware, cacheAllMiddleware};