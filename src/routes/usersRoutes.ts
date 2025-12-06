import { Router } from "express";

import { deleteMyAccountHandler, getMyProfileHandler, getUserHandler, getUsersHandler, registerHandler, updateMyUserProfileHandler, updateRoleHandler } from "../controllers/usersController.js";

const usersRouter = Router();

// TODO validate
usersRouter.post("/users", registerHandler);

// TODO auth middleware
usersRouter.get("/users/me", getMyProfileHandler);

// TODO auth middleware
usersRouter.put("/users/me", updateMyUserProfileHandler);

// TODO auth middleware
usersRouter.delete("/users/me", deleteMyAccountHandler);

// admin
usersRouter.patch("/users/:id/role", updateRoleHandler);

// TODO role check
usersRouter.get("/users", getUsersHandler);

// TODO admin
usersRouter.get("/users/:id", getUserHandler);

export default usersRouter;
