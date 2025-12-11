import { Router } from "express";
import {
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import { updateCommentSchema } from "../validations/commentValidation.js";

const router = Router();

router.put(
  "/comments/:id",
  authMiddleware,
  validationMiddleware(updateCommentSchema),
  updateCommentHandler
);
router.delete("/comments/:id", authMiddleware, deleteCommentHandler);

export default router;
