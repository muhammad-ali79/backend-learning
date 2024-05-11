import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import loggedInUser from "../utils/getLoggedinUser.js";

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const requestedUser = loggedInUser(req);

  const { videoId } = req.params;
  const { commentContent } = req.body;

  if (!commentContent || commentContent.lenght < 5)
    throw new ApiError(
      400,
      "comment should not be empty or less than 5 characters"
    );

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "vidoe not found for the given id");

  if (!video.isPublished)
    throw new ApiError(403, "cannot comment on a unpublished field");

  const comment = await Comment.create({
    content: commentContent,
    video: videoId,
    owner: requestedUser,
  });

  await video.save();

  const response = new ApiResponse(
    201,
    comment,
    "comment is added successfully to the video"
  );

  return res.status(response.statusCode).json(response);
});

const updateComment = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { commentId } = req.params;
  const { commentContent } = req.body;

  const comment = await Comment.findOne({
    _id: commentId,
    owner: requestedUser,
  });

  if (!comment)
    throw new ApiError(
      404,
      "No comment Found for the given id and loggedinUser"
    );

  if (commentContent !== comment.content) {
    comment.content = commentContent;
    await comment.save();
  }

  const response = new ApiResponse(
    201,
    comment,
    "comment is updated sucessfully"
  );
  return res.status(response.statusCode).json(response);
});

const deleteComment = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);

  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: requestedUser,
  });

  if (!comment)
    throw new ApiError(
      404,
      "No comment Found for the given id and loggedinUser"
    );

  const response = new ApiResponse(200, {}, "comment deleted successfully");
  return res.status(response.statusCode).json(response);
});

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video

  loggedInUser(req);

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const toSkip = (page - 1) * limit;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "No Video found for the given id");

  const comments = await Comment.find(
    { video: videoId },
    { content: 1, owner: 1 }
  )
    .skip(toSkip)
    .limit(limit);

  if (comments.length === 0)
    res.status(404).json(new ApiResponse(404, {}, "No comments on the video"));

  const response = new ApiResponse(
    200,
    comments,
    "all comments fetched successfully"
  );

  return res.status(response.statusCode).json(response);
});

export { getVideoComments, addComment, updateComment, deleteComment };

// Todo:Dont allow to store multiple comments of same contents
//        by adding a field on schema contentHash(index:true) and
//        generating the hash of a comment and stroing it in contentHash
//        and comparing others comments when creating a comments
