import express from "express";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import { TspecDocsMiddleware } from "tspec";
import { rateLimit } from "express-rate-limit";
import { HttpStatusCode } from "axios";

import v1Router from "./routes/index.js";
import env from "./configs/env.js";
import errorhandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/error.js";

const initServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, opt) => {
      next(new AppError("Too Many Requests", HttpStatusCode.TooManyRequests));
    }
  });
  app.use(globalRateLimiter);

  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  const corsOptions: CorsOptions = {
    origin(requestOrigin, callback) {
      const allowedOrgins = env.ALLOWED_ORIGINS!.split(",") || [];
      if (!requestOrigin || allowedOrgins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  };
  app.use(cors(env.NODE_ENV === "development" ? {} : corsOptions));

  // TODO swagger ui
  app.use("/docs", await TspecDocsMiddleware());
  app.use("/v1/api", v1Router);

  app.get("/health", (req, res) => {
    res.status(HttpStatusCode.Ok).json({
      status: "Ok",
      uptime: `${process.uptime().toFixed(2)}`
    });
  });

  app.use(errorhandler);

  app.listen(env.PORT, () => {
    console.log(`server listening to http://localhost:${env.PORT}/`);
  });
};

initServer();

// TODO graceful shutdown
