import { Router } from "express";

import {
  getTopRatedMangasHandler,
  getTopReviewsHandler,
} from "../controllers/statsController.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";

const router = Router();

router.get("/stats/top-reviews", cacheMiddleware, getTopReviewsHandler);

router.get(
  "/stats/top-rated-mangas",
  cacheMiddleware,
  getTopRatedMangasHandler
);

export default router;
