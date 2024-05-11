import { Router } from "express";
import validateId from "../middlewares/validateIds.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  validateId,
  // enjecting multer middleware
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  // .post will automitacclay passed the req,res,next
  registerUser
);

router.route("/login").post(loginUser);

// secured route (mean user should be loggedin)
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/user").get(verifyJWT, getCurrentUser);

router.route("/update-details").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:channelName").patch(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
