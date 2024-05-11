import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validateIds.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.route("/create").post(verifyJWT, createPlaylist);

router.route("/user/:userId").get(validateId, verifyJWT, getUserPlaylists);

router.route("/:playlistId").get(validateId, verifyJWT, getPlaylistById);

router
  .route("/:playlistId/add/:videoId")
  .post(validateId, verifyJWT, addVideoToPlaylist);

router
  .route("/:playlistId/remove/:videoId")
  .delete(validateId, verifyJWT, removeVideoFromPlaylist);

router
  .route("/delete/:playlistId")
  .delete(validateId, verifyJWT, deletePlaylist);

router
  .route("/update/:playlistId")
  .patch(validateId, verifyJWT, updatePlaylist);

export default router;
