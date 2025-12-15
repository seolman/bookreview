import { Router } from "express";

import {
  googleCallbackHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import { loginUserSchema } from "../validations/authValidation.js";
import env from "../configs/env.js";

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

authRouter.get("/auth/google", (_req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;
  res.status(302).redirect(redirectUrl);
});
authRouter.get("/auth/google/callback", googleCallbackHandler);

// TODO
// authRouter.use("/auth/firebase/naver");

export default authRouter;
