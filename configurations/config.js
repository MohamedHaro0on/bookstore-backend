import mongoose from 'mongoose';
import process from 'process';
import redis from 'redis';
import { systemLogger } from '../utils/logger.js';

const DBconnection = async () =>  {
  try {

    await mongoose.connect(process.env.DB_URI);

    systemLogger.info(`MongoDB is connected at ${process.env.DB_URI.split('$')[0]}${process.env.DB_Name}`);
  } catch (e) {
    systemLogger.error(`Error in connecting to MongoDB : ${e}`);
    process.exit(1);
  }
};

const redisClient  = redis.createClient({
  url: process.env.REDIS_URL,
});

const redisConnection = async () => {
  try{
    await redisClient .connect();

    systemLogger.info(`Redis is connected at ${process.env.REDIS_URL}`);
  } catch (e) {
    systemLogger.error(`Error in connecting to Redis : ${e}`);
    process.exit(1);
  }
};

export {DBconnection, redisConnection, redisClient};
