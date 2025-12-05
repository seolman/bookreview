import express from "express";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import { TspecDocsMiddleware } from "tspec";

import v1Router from "./routes/index.js";
import env from "./configs/env.js";
import { HttpStatusCode } from "axios";
import errorhandler from "./middlewares/errorMiddleware.js";

const initServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  const corsOptions: CorsOptions = {
    origin(requestOrigin, callback) {
      // TODO add origin
      if (!requestOrigin || "*") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  };
  app.use(cors(env.NODE_ENV === "development" ? {} : corsOptions));

  // TODO
  app.use("/docs", await TspecDocsMiddleware());
  app.use("/v1/api", v1Router);

  app.get("/healthz", (_, res) => {
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
