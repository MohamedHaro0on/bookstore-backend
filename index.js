import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import DBconnection from "./configurations/config.js";
import errorHandler from "./handlers/error.handler.js";
import routeNotImplementedHandler from "./handlers/notImplementedRoute.handler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoutes from "./modules/user/routes/user.routes.js";
import bookRouter from "./modules/book/routes/book.routes.js";
const app = express();

config(); // to Setup the dotenv  ;

DBconnection();

// Adding middleware for CORS, JSON parsing, and cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Routes :
app.use("/api/v1/user", UserRoutes);
app.use("/book/", bookRouter);
// Not implemented Errors :
app.all("*", routeNotImplementedHandler);
// Global error handling middleware for express ;
app.use(errorHandler);

// LISTEN
const server = app.listen(process.env.PORT, () => {
  console.log("this is the console app on : ", process.env.PORT);
});

// handle rejections outside of the express
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
  console.error("unhandledRejection", err.name, "  message : ", err?.message);
  server.close(() => {
    console.log("the application is shutting down");
    process.exit(1);
  });
});
