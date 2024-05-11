import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary, {
  updateCloudinaryAsset,
  deleteCloudinaryAssets,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/apiResponse.js";
import loggedInUser from "../utils/getLoggedinUser.js";

let deleteAssetsOnError;
const publishAVideo = asyncHandler(async (req, res) => {
  try {
    loggedInUser(req);
    const { title, description } = req.body;

    // if there is not path then this ? will give undefined and will not throw an error
    const videoPath = req.files?.video?.[0].path;
    const videoThumbnailPath = req.files?.videoThumbNail?.[0].path;

    if (!videoPath || !videoThumbnailPath)
      throw new ApiError(400, "video and videoThumbNail is required");

    // Upload on cloudinary
    const videoCloud = await uploadOnCloudinary(videoPath);
    const videoThumbNail = await uploadOnCloudinary(videoThumbnailPath);

    if (!videoCloud || !videoThumbNail)
      throw new ApiError(
        400,
        "Failed to upload vidoe or thumbnail to cloudinary"
      );

    deleteAssetsOnError = async () => {
      await Promise.all([
        deleteCloudinaryAssets([videoCloud.public_id], "video"),
        deleteCloudinaryAssets([videoThumbNail.public_id], "image"),
      ]);
    };

    const video = await Video.create({
      videoFile: videoCloud?.url,
      thumbnail: videoThumbNail?.url,
      owner: req.user._id,
      duration: Number(videoCloud.duration),
      title,
      description,
    });

    if (!video) throw new ApiError(400, "Failed to save video in database");

    return res
      .status(201)
      .json(new ApiResponse(200, video, "Video uploaded successfully"));
  } catch (error) {
    if (deleteAssetsOnError) await deleteAssetsOnError();
    throw error;
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  loggedInUser(req);
  const { page = 1, limit = 10, query, sortBy, userId } = req.query;
  let { sortType } = req.query;

  if (sortType === "asc") sortType = 1;
  if (sortType === "desc") sortType = -1;

  let docToSkip;
  if (page > 1) docToSkip = (page - 1) * limit;

  const videos = await Video.find({
    $and: [{ title: query }, { owner: userId }],
  })
    .sort({ [sortBy]: sortType })
    .skip(docToSkip)
    .limit(+limit);

  if (!videos?.length) throw new ApiError(404, "No videos Found");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos Fetched Successfuly"));
});

const getVideoById = asyncHandler(async (req, res) => {
  loggedInUser(req);
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "No video Found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  loggedInUser(req);
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailToUpdatePath = req.file?.path;

  if (!title && !description && !thumbnailToUpdatePath)
    throw new ApiError(
      400,
      "Title or Description or new thumbnail is required to update the video"
    );

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "No Video Found");

  let fieldsToUpdate = {};
  if (title && title !== video.title) fieldsToUpdate.title = title;
  if (description && description !== video.description)
    fieldsToUpdate.description = description;

  let updatedVideo;
  if (Object.keys(fieldsToUpdate).length > 0) {
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          ...fieldsToUpdate,
        },
      },
      { new: true }
    );
  }

  if (!updateVideo) throw new ApiError(404, "No video to be updated");

  if (thumbnailToUpdatePath) {
    const thumbnailURL = updatedVideo.thumbnail;
    // http://res.cloudinary.com/dimocioka/image/upload/v1712747668/sxgr6gb0wna2gghqocv3.jpg

    const parts = thumbnailURL.split("/");
    const public_id = parts.at(-1).split(".")[0];

    await updateCloudinaryAsset(thumbnailToUpdatePath, public_id);
  }

  return res.json(
    new ApiResponse(200, updatedVideo, "Video updated successfully")
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  loggedInUser(req);
  const { videoId } = req.params;

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new ApiError(404, "video Not found");

  const videoPublicId = video.videoFile.split("/").at(-1).split(".")[0];
  const thumbnailPublicId = video.thumbnail.split("/").at(-1).split(".")[0];

  const deletedAssets = await Promise.all([
    deleteCloudinaryAssets([videoPublicId], "video"),
    deleteCloudinaryAssets([thumbnailPublicId], "image"),
  ]);

  if (!deletedAssets)
    throw new ApiError(404, "incorrect video or image Public Id");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  loggedInUser(req);
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video Not Found");

  const status = !video.isPublished;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: status,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Staus Changed successfully"));
});

export {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
