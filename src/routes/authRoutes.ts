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

authRouter.post(
  "/auth/refresh",
  // validationMiddleware(RefreshRequestSchema),
  refreshHandler
);

// authRouter.use("/auth/google");
// authRouter.use("/auth/google/callback");

export default authRouter;
