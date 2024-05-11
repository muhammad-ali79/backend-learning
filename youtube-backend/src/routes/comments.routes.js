import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/video/:videoId/add").post(validateId, verifyJWT, addComment);

router.route("/update/:commentId").patch(validateId, verifyJWT, updateComment);

router.route("/delete/:commentId").delete(validateId, verifyJWT, deleteComment);

router
  .route("/get/video/:videoId")
  .get(validateId, verifyJWT, getVideoComments);
export default router;
