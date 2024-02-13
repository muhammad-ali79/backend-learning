import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

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

  // VAIDATION: if any of the field is empy then throw new apiError
  if (
    [userName, email, fullName, password].some((field) => {
      console.log(userName, email, fullName, password);
      field.trim() === "";
    })
  )
    throw new ApiError(400, "All fields are required");

  // if user is already exist
  // User schema wil serach in the database that if usreName or email already exit
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

  // saving the user object in the db
  const user = await User.create({
    fullName,
    email,
    password,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check for user Creation
  // checking if the user is sucessfully creaed in db and removing the password and refreshToken fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
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

    // data to update
    {
      $set: { refreshToken: undefined },
    },

    // adding new property
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

export { registerUser, loginUser, logoutUser };
