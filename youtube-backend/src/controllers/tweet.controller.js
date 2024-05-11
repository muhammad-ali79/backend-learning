import { Tweet } from "../models/tweet.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import loggedInUser from "../utils/getLoggedinUser.js";
import convertIdToString from "../utils/convertIdToString.js";

const fetchTweetByIdAndUser = async function (tweetId, user) {
  const tweet = await Tweet.findOne({
    _id: tweetId,
    owner: user,
  });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (convertIdToString(tweet.owner) !== convertIdToString(user)) {
    throw new ApiError(403, "Unauthorized access to Tweet");
  }
  return tweet;
};

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const requestedUser = loggedInUser(req);

  const { tweetText } = req.body;

  if (!tweetText || tweetText.lenght < 5)
    throw new ApiError(400, "tweet cannot be empty or less than 5 characters");

  const tweet = await Tweet.create({
    content: tweetText,
    owner: requestedUser,
  });

  if (!tweet)
    throw new ApiError(
      500,
      "Something went wrong while creating Tweet.Please Try Again"
    );

  const response = new ApiResponse(201, tweet, "Tweet created Successfully");
  return res.status(response.statusCode).json(response);
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const requestedUser = loggedInUser(
    req,
    userId,
    "only an authorized user can access his Tweets"
  );

  const { page = 1, limit = 10 } = req.query;
  const toSkip = (page - 1) * limit;

  const tweets = await Tweet.find({
    owner: requestedUser,
  })
    .skip(toSkip)
    .limit(+limit);

  if (tweets.length < 1)
    throw new ApiError(404, "No Tweets found. please create one");

  const response = new ApiResponse(
    200,
    tweets,
    "all Tweets Fetched successfully"
  );

  return res.status(response.statusCode).json(response);
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const requestedUser = loggedInUser(req);

  const { tweetId } = req.params;
  const { tweetText } = req.body;

  if (!tweetText || tweetText.lenght < 5)
    throw new ApiError(400, "tweet cannot be empty or less than 5 characters");

  const tweet = await fetchTweetByIdAndUser(tweetId, requestedUser);
  if (tweetText && tweetText !== tweet.content) tweet.content = tweetText;
  await tweet.save();

  const response = new ApiResponse(201, tweet, "Tweet Updated successfully");
  return res.status(response.statusCode).json(response);
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const requestedUser = loggedInUser(req);

  const { tweetId } = req.params;

  await fetchTweetByIdAndUser(tweetId, requestedUser);
  await Tweet.deleteOne({ _id: tweetId });

  const response = new ApiResponse(200, "Tweet deleted successfully");
  return res.status(response.statusCode).json(response);
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
