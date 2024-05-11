import { User } from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import loggedInUser from "../utils/getLoggedinUser.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  loggedInUser(req);
  const { channelName } = req.params;
  if (!channelName?.trim()) throw new ApiError(400, "channelName is missing");

  const stats = await User.aggregate([
    {
      $match: { userName: channelName.toLowerCase() },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriptions",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: null,
        // sum is necessary in group thats why it is used main thing is done by $size
        totalVideos: { $sum: { $size: "$videos" } },
        totalSubscribers: { $sum: { $size: "$subscriptions" } },
        totalLikes: { $sum: { $size: "$likes" } },
        // if views exists calulate sum else 0
        totalViews: { $sum: { $ifNull: ["$videos.views", 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalSubscribers: 1,
        totalLikes: 1,
        totalViews: 1,
      },
    },
  ]);

  if (stats.length === 0) throw new ApiError(404, "channel not Found");

  res
    .status(200)
    .json(new ApiResponse(200, stats, "stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel loggedInUser(req);
  loggedInUser(req);
  const { channelName } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!channelName?.trim()) throw new ApiError(400, "channelName is missing");

  const videosAggregation = await User.aggregate([
    {
      $match: { userName: channelName.toLowerCase() },
    },
    {
      $lookup: {
        localField: "_id",
        foreignField: "owner",
        from: "videos",
        as: "videos",
        pipeline: [
          {
            $match: { isPublished: true },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: +limit,
          },
          {
            $project: {
              videoFile: 1,
              thumbNail: 1,
              title: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
            },
          },
        ],
      },
    },

    {
      $project: { videos: 1 },
    },
  ]);

  // const videos = await User.aggregatePaginate(videosAggregation, {
  //   limit: +limit,
  //   page: +page,
  // }).then((docs) => docs.docs);
  const response = new ApiResponse(
    200,
    videosAggregation,
    "All videos Fetched successfully"
  );
  return res.status(response.statusCode).json(response);
});

export { getChannelStats, getChannelVideos };
