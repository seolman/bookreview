import { Router } from "express";

import { loginHandler, logoutHandler, registerHandler } from "../controllers/authController.js";
import validationHandler from "../middlewares/validationMiddleware.js";

const authRouter = Router();

// TODO add validation
authRouter.use("/register", registerHandler);

// TODO add validation
authRouter.use("/login", loginHandler);

// TODO
authRouter.use("/logout", logoutHandler);

// authRouter.use("/refresh");

// authRouter.use("/google");
// authRouter.use("/google/callback");

export default authRouter;
