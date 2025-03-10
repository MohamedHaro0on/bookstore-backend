import process from 'node:process';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {config} from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import {DBconnection, redisConnection} from './configurations/config.js';
import errorHandler from './handlers/error.handler.js';
import routeNotImplementedHandler from './handlers/not.implemented.route.handler.js';
import bookRouter from './modules/book/routes/book.routes.js';
import cartRouter from './modules/cart/routes/cart.routes.js';
import orderRoutes from './modules/order/routes/order.routes.js';
import ReviewRoutes from './modules/review/routes/review.routes.js';
import UserRoutes from './modules/user/routes/user.routes.js';

const app = express();

config(); // to Setup the dotenv  ;

DBconnection();
redisConnection();

// Adding middleware for CORS, JSON parsing, and cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

// serving static files :
app.use('/public/users', express.static('public/users'));
app.use('/public/books', express.static('public/books'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes :
app.use('/users/', UserRoutes);
app.use('/books/', bookRouter);
app.use('/carts/', cartRouter);
app.use('/reviews/', ReviewRoutes);
app.use('/orders/', orderRoutes);
// Not implemented Errors :
app.all('*', routeNotImplementedHandler);
// Global error handling middleware for express ;
app.use(errorHandler);

// LISTEN
const server = app.listen(process.env.PORT, () => {
});

// handle rejections outside of the express
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
  console.error('unhandledRejection', err.name, '  message : ', err?.message);
  server.close(() => {
    process.exit(1);
  });
});
