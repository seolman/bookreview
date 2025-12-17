import express from "express";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import { TspecDocsMiddleware } from "tspec";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { HttpStatusCode } from "axios";

import v1Router from "./routes/index.js";
import env from "./configs/env.js";
import errorhandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/error.js";
import logger from "./utils/logger.js";
import { redis } from "./db/redis.js";
import { register } from "./configs/prometheus.js";

export const createApp = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.sendCommand(args),
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError("Too Many Requests", HttpStatusCode.TooManyRequests));
    },
  });
  app.use(globalRateLimiter);

  app.use(
    morgan(env.NODE_ENV === "development" ? "dev" : "combined", {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );

  if (env.NODE_ENV === "production") {
    const corsOptions: CorsOptions = {
      origin(requestOrigin, callback) {
        const allowedOrgins = env.ALLOWED_ORIGINS?.split(",") || [];
        if (!requestOrigin || allowedOrgins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    };
    app.use(cors(corsOptions));
  } else {
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
  }

  app.use(
    "/docs",
    await TspecDocsMiddleware({
      openapi: {
        securityDefinitions: {
          jwt: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    })
  );
  app.use("/v1/api", v1Router);

  app.get("/health", (_req, res) => {
    res.status(HttpStatusCode.Ok).json({
      status: "Ok",
      uptime: `${process.uptime().toFixed(2)}`,
    });
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  app.use(errorhandler);

  return app;
};
