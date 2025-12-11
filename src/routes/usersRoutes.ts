import { Router } from "express";

import { getFavoritesByUserHandler } from "../controllers/favoritesController.js";
import { getReviewsByUserHandler } from "../controllers/reviewsController.js";
import {
  deleteMyAccountHandler,
  getMyProfileHandler,
  getUserHandler,
  getUsersHandler,
  registerHandler,
  updateMyUserProfileHandler,
  updateRoleHandler,
} from "../controllers/usersController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import { registerUserSchema } from "../validations/authValidation.js";
import { updateUserRoleSchema } from "../validations/userValidation.js";

const usersRouter = Router();

usersRouter.post(
  "/users",
  validationMiddleware(registerUserSchema),
  registerHandler
);

usersRouter.get("/users/me", authMiddleware, getMyProfileHandler);

usersRouter.put("/users/me", authMiddleware, updateMyUserProfileHandler);

usersRouter.delete("/users/me", authMiddleware, deleteMyAccountHandler);

usersRouter.get("/users/:id/reviews", getReviewsByUserHandler);

usersRouter.get("/users/:id/favorites", getFavoritesByUserHandler);

usersRouter.patch(
  "/users/:id/role",
  authMiddleware,
  authorizeRoles(["admin"]),
  validationMiddleware(updateUserRoleSchema),
  updateRoleHandler
);

usersRouter.get(
  "/users",
  authMiddleware,
  authorizeRoles(["admin"]),
  getUsersHandler
);

usersRouter.get(
  "/users/:id",
  authMiddleware,
  authorizeRoles(["admin"]),
  getUserHandler
);

export default usersRouter;
