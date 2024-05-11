import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/stats/:channelName").get(verifyJWT, getChannelStats);

router.route("/:channelName/allvideos").get(verifyJWT, getChannelVideos);

export default router;
