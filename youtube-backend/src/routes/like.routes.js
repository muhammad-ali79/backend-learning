import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/video/:videoId").post(validateId, verifyJWT, toggleVideoLike);

router
  .route("/comment/:commentId")
  .post(validateId, verifyJWT, toggleCommentLike);

router.route("/tweet/:tweetId").post(validateId, verifyJWT, toggleTweetLike);

router.route("/getvideos").get(verifyJWT, getLikedVideos);

export default router;
