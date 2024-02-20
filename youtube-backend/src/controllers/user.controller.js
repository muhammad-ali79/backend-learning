import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //  creating and settting the refreshTokens
    user.refreshToken = refreshToken;

    // saving the user
    // here we set validateBeforeSave to false because if we dont then we have to give every propery that is in the schema
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*
  step to register a user

  get the data from the frontend (postman)
  validation on data (e.g not empty, lowercase etc)
  check if the user is already exist (using email or usreName if it is unique)
  if not register then get the images(cover image) , avatar (required)
  upload them to cloudinary
  check if avatar that is rquired upload successfully
  create user object -- create entry in db
  remove password and refresh token field  from response before stroing in the db
  check for user creation
  return res
*/

  // console.log("REQUEST BODY: ", req.body);

  // extracting the data form the req
  const { userName, email, fullName, password } = req.body;

  // VALIDATION: if any of the field is empy then throw new apiError
  // if any of the field is empty string then return true
  if (
    [userName, email, fullName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // if user is already exist
  // User schema wil serach in the database that if usreName or email already exit
  // here User is a collection in the database or the model that i create
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser)
    throw new ApiError(409, "User with email and password already exist");

  // gettting the image path
  // multer already upload the file from the router in the local server so here we are just taking the filepath

  // console.log("request.Files", req.files);
  // console.log("complete", req.files.coverImage);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  // uplaod images on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // checking if the avatar is not upload successfully
  if (!avatar) throw new Error(400, "Avatar is required");

  // creating and  saving the user object in the db
  const user = await User.create({
    fullName,
    email,
    password,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check for user Creation
  // checking if the user is sucessfully creaed in db and removing the password and  fields for sending response to the user
  // select all the fields expect password and refreshToken
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser)
    throw new ApiError(500, "someting went wrong while registering the user");

  // returing the respone status and json respone
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user is registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*  steps to login  a user

  1. get data from request body
  2. login based on email or userName (if user is already register)
  3. find the user (with email or userName)
  4. check the password (by password in db)
  5. generate Access and Refresh Tokens
  6. send cookie
  */

  // 1.
  const { userName, email, password } = req.body;

  // 2.
  if (!userName && !email)
    throw new ApiError(400, "usreName or password is required");

  // if (!(userName || email))
  //   throw new ApiError(400, "userName or email is required");

  // 3.
  // find the user if any of the given propery matched
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) throw new ApiError(404, "user does not exist. please register");

  // 4.
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  // 5.
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // user after generating the tokens because   user before doest not  has the field of refreshToken so we will remove some fields to make a response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6.
  // options for cookies so that only server can change them
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },

        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,

    // // data to update
    // {
    //   $set: { refreshToken: undefined },
    // },

    {
      $unset: {
        refreshToken: 1,
      },
    },

    //  This option tells Mongoose to return the modified document rather than the original one.  So user will hold the updated document
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

  try {
    // this will decode the token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    // comparing the refresh token from the db refreshToekn
    if (!incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "refreshToken expired");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken();

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id); // req.user come from auth middleware because we will use the auth middleware
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(401, "invalid old password");

  user.password = newPassword;
  // saving the changed password in db
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(201, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if (!email || !fullName) throw new ApiError(400, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    //  This option tells Mongoose to return the modified document rather than the original one.  So user will hold the updated document
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(201, user, "Account details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) throw new ApiError(400, "Error While uplading the file");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath)
    throw new ApiError(400, "coverImage file is missing");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) throw new ApiError(400, "Error While uplading the file");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params; // from url

  if (!userName?.trim()) throw new ApiError(400, "userName is missing");

  const channel = User.aggregate([
    {
      $match: {
        // match will give one doc who will match the username
        userName: userName?.toLowerCase(),
      },
    },

    // will make subcribers property of documents if localField match with foreignField on the document who come after matching
    // this stage will get all the documents of the subcribers
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subcribers",
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subcribedTo",
      },
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subcribers",
        },

        channelsSubcribedToCount: {
          $size: "$subcribedTo",
        },

        isSubscribed: {
          $cond: {
            // if id in subcribers.subcriber will match the id in req.user then return true
            if: {
              $in: [req.user._id, "$subcribers.subcriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    // only these fields will remain in the document
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(404, "channel does not exists");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = User.aggregate([
    {
      $match: {
        // here we cannot just write req.user.id because aggregate doest not use mongoose its code go directly in to the mongodb and mongodb required ObjectId(_id) so that i generate using mongoose
        _id: new mongoose.Type.ObjectId(req.user?._id),
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id", // video id
        as: "watchHistory",
      },
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",

            pipeline: [
              {
                $project: {
                  userName: 1,
                  fullName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            owner: {
              $first: "$owner",
            },
          },
        },
      ],
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};

// lookup: document to stick (to join two docs)
