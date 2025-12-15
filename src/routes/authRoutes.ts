import { Router } from "express";

import {
  loginHandler,
  logoutHandler,
  refreshHandler,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import { loginUserSchema } from "../validations/authValidation.js";

const authRouter = Router();

authRouter.post(
  "/auth/login",
  validationMiddleware(loginUserSchema),
  loginHandler
);

authRouter.post("/auth/logout", authMiddleware, logoutHandler);

// TODO change to redis
authRouter.post(
  "/auth/refresh",
  // validationMiddleware(RefreshRequestSchema),
  refreshHandler
);

// TODO
// authRouter.use("/auth/google");
// authRouter.use("/auth/google/callback");

// TODO
// authRouter.use("/auth/naver");
// authRouter.use("/auth/naver/callback");

export default authRouter;
