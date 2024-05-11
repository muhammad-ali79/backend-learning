import { Router } from "express";
import {
  deleteVideo,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  getAllVideos,
} from "../controllers/video.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";

const router = Router();

router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "videoThumbNail", maxCount: 1 },
  ]),
  publishAVideo
);

router.route("/allvideos").get(verifyJWT, getAllVideos);

router.route("/:videoId").get(validateId, verifyJWT, getVideoById);

router
  .route("/update/:videoId")
  .patch(validateId, verifyJWT, upload.single("thumbNail"), updateVideo);

router.route("/delete/:videoId").delete(validateId, verifyJWT, deleteVideo);

router
  .route("/status/:videoId")
  .patch(validateId, verifyJWT, togglePublishStatus);
export default router;
