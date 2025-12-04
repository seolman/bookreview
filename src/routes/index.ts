import { Router } from "express";

import authRouter from "./authRoutes.js";
import usersRouter from "./usersRoutes.js";
import mangasRouter from "./mangasRoutes.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);

v1Router.use("/users", usersRouter);

v1Router.use("/mangas", mangasRouter);

// v1Router.use("/reviews");

// v1Router.use("/comments");

export default v1Router;
