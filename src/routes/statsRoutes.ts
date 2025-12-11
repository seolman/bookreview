import { Router } from "express";

import {
  getTopRatedMangasHandler,
  getTopReviewsHandler,
} from "../controllers/statsController.js";

const router = Router();

router.get("/stats/top-reviews", getTopReviewsHandler);

router.get("/stats/top-rated-mangas", getTopRatedMangasHandler);

export default router;
