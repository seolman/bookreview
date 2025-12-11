import { Router } from "express";

import {
  createCommentHandler,
  getCommentsByReviewHandler,
} from "../controllers/commentsController.js";
import {
  deleteReviewHandler,
  getReviewByIdHandler,
  updateReviewHandler,
} from "../controllers/reviewsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import { createCommentSchema } from "../validations/commentValidation.js";
import { updateReviewSchema } from "../validations/reviewValidation.js";

const router = Router();

router.get("/reviews/:id", getReviewByIdHandler);
router.put(
  "/reviews/:id",
  authMiddleware,
  validationMiddleware(updateReviewSchema),
  updateReviewHandler
);
router.delete("/reviews/:id", authMiddleware, deleteReviewHandler);

router.post(
  "/reviews/:id/comments",
  authMiddleware,
  validationMiddleware(createCommentSchema),
  createCommentHandler
);
router.get("/reviews/:id/comments", getCommentsByReviewHandler);

export default router;
