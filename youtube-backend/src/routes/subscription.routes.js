import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";

const router = Router();

router
  .route("/togglesubscription/:channelId")
  .post(validateId, verifyJWT, toggleSubscription);

router
  .route("/getsubscribers/:channelId")
  .get(validateId, verifyJWT, getUserChannelSubscribers);

router
  .route("/getchannels/:subscriberId")
  .get(validateId, verifyJWT, getSubscribedChannels);

export default router;
