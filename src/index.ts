import express from "express";
import morgan from "morgan";
import { TspecDocsMiddleware } from "tspec";

import router from "./routes/index.js";
import config from "./config.js";

const initServer = async () => {
  const app = express();

  app.use(morgan(config.ENV === "development" ? "dev" : "combined"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/docs", await TspecDocsMiddleware());

  app.use("/api", router);

  app.listen(config.PORT, () => {
    console.log(`server listening to http://localhost:${config.PORT}/`);
  });
};

initServer();
