import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import ApiResponse from "../utils/apiResponse.js";
import loggedInUser from "../utils/getLoggedinUser.js";
import { Video } from "../models/video.model.js";
import convertIdToString from "../utils/convertIdToString.js";

const fetchPlaylistByIdAndUser = async (playlistId, user) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner: user });
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (convertIdToString(playlist.owner) !== convertIdToString(user)) {
    throw new ApiError(403, "Unauthorized access to playlist");
  }
  return playlist;
};

const createPlaylist = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { name, description } = req.body;
  if (!(name || description))
    throw new ApiError(400, "input Fields should not be empty");

  const playlist = await Playlist.create({
    name,
    description,
    owner: requestedUser,
  });

  if (!playlist)
    throw new ApiError(500, "someThing went wrong when creating Playlist");

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const requestedUser = loggedInUser(
    req,
    userId,
    "only an authorized user can  access his Playlists"
  );

  const toSkip = (page - 1) * limit;
  const playlists = await Playlist.find({
    owner: requestedUser,
  })
    .skip(toSkip)
    .limit(+limit);

  if (playlists.length < 1)
    throw new ApiError(404, "playlists not found.PleaseCreate a new one");

  return res
    .status(201)
    .json(
      new ApiResponse(200, playlists, "All Playlists Fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { playlistId } = req.params;

  const playlist = await fetchPlaylistByIdAndUser(playlistId, requestedUser);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { playlistId, videoId } = req.params;

  const playlist = await fetchPlaylistByIdAndUser(playlistId, requestedUser);

  const video = await Video.findOne({ _id: videoId, owner: requestedUser });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.isPublished) {
    throw new ApiError(403, "Video is not public");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  // Return response with updated playlist using ApiResponse
  const response = new ApiResponse(
    201,
    playlist,
    "Video added to playlist successfully"
  );
  res.status(response.statusCode).json(response);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { playlistId, videoId } = req.params;

  const playlist = await fetchPlaylistByIdAndUser(playlistId, requestedUser);

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(404, "Video not found in the playlist");
  }

  // Remove the video from the playlist
  playlist.videos.pull(videoId);
  await playlist.save();

  // Return success response
  const response = new ApiResponse(
    200,
    "Video removed from playlist successfully"
  );
  res.status(response.statusCode).json(response);
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { playlistId } = req.params;

  await fetchPlaylistByIdAndUser(playlistId, requestedUser);

  await Playlist.deleteOne({ _id: playlistId });

  const response = new ApiResponse(200, "Playlist deleted successfully");
  return res.status(response.statusCode).json(response);
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playlist = await fetchPlaylistByIdAndUser(playlistId, requestedUser);

  // Update the playlist fields
  if (name && name !== playlist.name) {
    playlist.name = name;
  }
  if (description && description !== playlist.description) {
    playlist.description = description;
  }

  await playlist.save();

  const response = new ApiResponse(
    201,
    playlist,
    "Playlist updated successfully"
  );
  return res.status(response.statusCode).json(response);
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  updatePlaylist,
};
