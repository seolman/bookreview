import { Router } from "express";

import authRouter from "./authRoutes.js";
import usersRouter from "./usersRoutes.js";
import mangasRouter from "./mangasRoutes.js";
import reviewsRouter from "./reviewsRoutes.js";
import commentsRouter from "./commentsRoutes.js";
import statsRouter from "./statsRoutes.js";

const v1Router = Router();

v1Router.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

v1Router.use(authRouter);

v1Router.use(usersRouter);

v1Router.use(mangasRouter);

v1Router.use(reviewsRouter);

v1Router.use(commentsRouter);

v1Router.use(statsRouter);

export default v1Router;
