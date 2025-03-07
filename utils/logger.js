import winston from 'winston';
import process from 'process';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define log colors (for console output)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);


const createLogger = (endpoint) => {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // The least level of logs to start logging from
    levels,
    
    // Define log format
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: [${endpoint}] ${info.message}`
      )
    ),
    defaultMeta: { endpoint }, // Add custom key-value pair for the endpoint
    // Define transports (where to output logs)
    transports: [ 
      new winston.transports.Console(), // Log to console with colorized output
      new winston.transports.File({
        filename: `logs/${endpoint}.log`, // Log to a file named after the endpoint
      }),
    ],
  });
};

const orderLogger = createLogger('order');
const userLogger = createLogger('user');
const bookLogger = createLogger('book');
const reviewLogger = createLogger('review');
const cartLogger = createLogger('cart');
const systemLogger = createLogger('system');

export { orderLogger, userLogger, bookLogger, reviewLogger, cartLogger, systemLogger };