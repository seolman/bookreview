import { Router } from "express";

import { loginHandler, logoutHandler } from "../controllers/authController.js";
import validationHandler from "../middlewares/validationMiddleware.js";

const authRouter = Router();

// TODO add validation
authRouter.post("/auth/login", loginHandler);

// TODO
authRouter.post("/auth/logout", logoutHandler);

// authRouter.use("/auth/refresh");

// authRouter.use("/auth/google");
// authRouter.use("/auth/google/callback");

export default authRouter;
