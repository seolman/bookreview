import { Router } from "express";

import { addFavoriteHandler } from "../controllers/favoritesController.js";
import {
  createMangaHandler,
  deleteMangaByIdHandler,
  getMangaByIdHandler,
  listMangasHandler,
  updateMangaByIdHandler,
} from "../controllers/mangasController.js";
import {
  createReviewHandler,
  getReviewsByMangaHandler,
} from "../controllers/reviewsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import {
  createMangaSchema,
  updateMangaSchema,
} from "../validations/mangaValidation.js";
import { createReviewSchema } from "../validations/reviewValidation.js";

const mangasRouter = Router();

mangasRouter.get("/mangas", listMangasHandler);

mangasRouter.get("/mangas/:id", getMangaByIdHandler);

mangasRouter.post(
  "/mangas/:id/reviews",
  authMiddleware,
  validationMiddleware(createReviewSchema),
  createReviewHandler
);
mangasRouter.get("/mangas/:id/reviews", getReviewsByMangaHandler);

mangasRouter.post("/mangas/:id/favorites", authMiddleware, addFavoriteHandler);

mangasRouter.put(
  "/mangas/:id",
  authMiddleware,
  authorizeRoles(["admin"]),
  validationMiddleware(updateMangaSchema),
  updateMangaByIdHandler
);

mangasRouter.delete(
  "/mangas/:id",
  authMiddleware,
  authorizeRoles(["admin"]),
  deleteMangaByIdHandler
);

mangasRouter.post(
  "/mangas",
  authMiddleware,
  authorizeRoles(["admin"]),
  validationMiddleware(createMangaSchema),
  createMangaHandler
);

export default mangasRouter;
