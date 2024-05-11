import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createTweet);

router.route("/user/:userId").get(validateId, verifyJWT, getUserTweets);

router.route("/update/:tweetId").patch(validateId, verifyJWT, updateTweet);

router.route("/delete/:tweetId").delete(validateId, verifyJWT, deleteTweet);

export default router;
