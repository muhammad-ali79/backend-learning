import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import loggedInUser from "../utils/getLoggedinUser.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

// this code stores all likes of a user on  one doc but is more complex to query and read by others
const overOptimizedToggleCode = () => {
  /*  const keepFields = ["video", "comment", "tweet"];
  const { userExistingLikes, filteredArray } = await Like.findOne({
    likedBy: requestedUser,
  }).then((likeDoc) => ({
    userExistingLikes: likeDoc,
    filteredArray: likeDoc
      ? Object.keys(likeDoc.toObject()).filter((item) =>
          keepFields.includes(item)
        )
      : [],
  }));

  if (
    userExistingLikes &&
    filteredArray.length === 1 &&
    userExistingLikes.video
  ) {
    await Like.findOneAndDelete({
      video: videoId,
      likedBy: requestedUser,
    });
    const response = new ApiResponse(200, {}, "video unliked successfully");
    return res.status(response.statusCode).json(response);
  }

  if (
    userExistingLikes &&
    filteredArray.length > 1 &&
    userExistingLikes.video
  ) {
    await updateLike(userExistingLikes);
    const response = new ApiResponse(200, {}, "video unliked successfully");
    return res.status(response.statusCode).json(response);
  }

  if (userExistingLikes && !userExistingLikes.video) {
    userExistingLikes.video = videoId;
    await userExistingLikes.save();
    const response = new ApiResponse(
      200,
      userExistingLikes,
      "video liked successfully"
    );
    return res.status(response.statusCode).json(response);
  }

  const newVideoLike = await Like.create({
    likedBy: requestedUser,
    video: videoId,
  });
  const response = new ApiResponse(
    200,
    newVideoLike,
    "video liked successfully"
  );
  return res.status(response.statusCode).json(response); */
  // async function updateLike(likeDoc) {
  //   await Like.findOneAndUpdate({ _id: likeDoc._id }, { $unset: { video: 1 } });
  // }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.isPublished) {
    throw new ApiError(403, "Cannot like an unpublished video");
  }

  const alreadyLikedVideo = await Like.findOneAndDelete({
    likedBy: requestedUser,
    video: videoId,
  });

  if (alreadyLikedVideo) {
    const response = new ApiResponse(200, {}, "video unliked successfully");
    return res.status(response.statusCode).json(response);
  }

  const newVideoLike = await Like.create({
    video: videoId,
    likedBy: requestedUser,
  });

  if (!newVideoLike)
    throw new ApiError(
      500,
      "something went wrong while trying to like the video"
    );

  const response = new ApiResponse(
    201,
    newVideoLike,
    "video liked successfully"
  );
  return res.status(response.statusCode).json(response);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "No comment Found");

  const alreadyLikedComment = await Like.findOneAndDelete({
    likedBy: requestedUser,
    comment: commentId,
  });

  if (alreadyLikedComment) {
    const response = new ApiResponse(200, {}, "comment unliked successfully");
    return res.status(response.statusCode).json(response);
  }

  const newCommentLike = await Like.create({
    comment: commentId,
    likedBy: requestedUser,
  });

  if (!newCommentLike)
    throw new ApiError(
      500,
      "something went wrong while trying to like the comment"
    );

  const response = new ApiResponse(
    201,
    newCommentLike,
    "comment liked successfully"
  );
  return res.status(response.statusCode).json(response);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "No tweet Found");

  const alreadyLikedTweet = await Like.findOneAndDelete({
    likedBy: requestedUser,
    tweet: tweetId,
  });

  if (alreadyLikedTweet) {
    const response = new ApiResponse(200, {}, "tweet unliked successfully");
    return res.status(response.statusCode).json(response);
  }

  const newTweetLike = await Like.create({
    tweet: tweetId,
    likedBy: requestedUser,
  });

  if (!newTweetLike)
    throw new ApiError(
      500,
      "something went wrong while trying to like the tweet"
    );

  const response = new ApiResponse(
    201,
    newTweetLike,
    "tweet liked successfully"
  );
  return res.status(response.statusCode).json(response);
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);
  const likeProjection = { _id: 1, likedBy: 1 };

  // here aggregations will be more better but i also want to learn some populate
  const video = await Like.find(
    {
      likedBy: requestedUser,
      video: { $exists: true },
    },
    likeProjection
  ).populate({
    path: "video",
    select: { title: 1, thumbnail: 1, videoFile: 1, views: 1, duration: 1 },
  });

  const response = new ApiResponse(
    200,
    video,
    "like videos fetched successfully"
  );
  return res.status(response.statusCode).json(response);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
