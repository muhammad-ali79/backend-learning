import mongoose from "mongoose";
import { Subscription } from "../models/subscriptions.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import loggedInUser from "../utils/getLoggedinUser.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subcriberId = loggedInUser(req);

  const alreadySubcribedUser = await Subscription.findOneAndDelete({
    $and: [{ channel: channelId }, { subscriber: subcriberId }],
  });

  if (alreadySubcribedUser) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubcribe SuccessFully"));
  }

  const subcriptionDoc = await Subscription.create({
    subscriber: subcriberId,
    channel: channelId,
  });

  if (!subcriptionDoc)
    throw new ApiError(404, "Channel to subcribed Not Found");

  const subcribedChannel = await User.findById(channelId).select(
    "-watchHistory -password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subcribedChannel, "Subcribed SuccessFully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const toSkip = (page - 1) * limit;

  const userId = new mongoose.Types.ObjectId(requestedUser).toString();

  if (channelId !== userId)
    throw new ApiError(403, "only a Verifed user can see his subscribers");

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              _id: 0,
              userName: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: "$subscriber",
    },

    // to execute sevral stages on the same dataset then consider $facet
    {
      $facet: {
        subscribers: [
          { $skip: toSkip },
          { $limit: +limit },
          { $project: { _id: 0, subscriber: 1 } },
        ],
      },
    },

    {
      $addFields: {
        subscribers: "$subscribers.subscriber",
      },
    },
  ]);

  if (subscribers[0].subscribers.length < 1)
    throw new ApiError(404, "No subscribers Found For the given Channel");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers[0],
        "Fetched all subscribers Successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
// aggregate Paginate will only apply if at the end of the aggregation if we many number of docs gt>1
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const requestedUser = loggedInUser(req);
  const { subscriberId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const toSkip = (page - 1) * limit;

  const userId = new mongoose.Types.ObjectId(requestedUser).toString();

  if (subscriberId !== userId)
    throw new ApiError(
      403,
      "Only a Verifed user can see the channels that he subcribed"
    );

  const aggregate = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              _id: 0,
              userName: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: "$channel",
    },

    {
      $facet: {
        channels: [
          { $skip: toSkip },
          { $limit: +limit },
          { $project: { _id: 0, channel: 1 } },
        ],
      },
    },

    // weired: how i am able to access
    {
      $addFields: {
        channels: "$channels.channel",
      },
    },
  ]);

  if (aggregate.length < 1) throw new ApiError(404, "No Channel Found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, aggregate[0], "Fetched all Channels SuccessFully")
    );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
