import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import DBconnection from "./configurations/config.js";
import errorHandler from "./handlers/error.handler.js";
import routeNotImplementedHandler from "./handlers/notImplementedRoute.handler.js";

const app = express();

config(); // to Setup the dotenv  ;

DBconnection();

// MiddleWares :
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Routes :

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
  console.error("unhandledRejection", err.name, "  message : ", err.message);
  server.close(() => {
    console.log("the application is shutting down");
    process.exit(1);
  });
});
