import { Router } from "express";

import { loginController, logoutController } from "../controllers/authController.js";

const authRouter = Router();

authRouter.use("/login", loginController);

authRouter.use("/logout", logoutController);

// authRouter.use("/refresh");

// authRouter.use("/google");
// authRouter.use("/google/callback");

export default authRouter;
