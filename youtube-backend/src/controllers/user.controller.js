import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // step to register a user

  // get the data from the frontend (postman)
  // validation on data (e.g not empty, lowercase etc)
  // check if the user is already exist (using email or usreName if it is unique)
  // if not register then get the images(cover image) , avatar (required)
  // upload them to cloudinary
  // check if avatar that is rquired upload successfully
  // create user object -- create entry in db
  // remove password and refresh token field  from response before stroing in the db
  // check for user creation
  // return res

  // extracting the data form the req
  const { userName, email, fullName, password } = req.body;

  // VAIDATION: if any of the field is empy then throw new apiError
  if (
    [userName, email, fullName, password].some((field) => field.trim() === "")
  )
    throw new ApiError(400, "All fields are required");

  // if user is already exist
  // User schema wil serach in the database that if usreName or email already exit
  const existedUser = User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser)
    throw new ApiError(409, "User with email and password already exist");

  // gettting the image path
  // multer already upload the file from the router in the local server so here we are just taking the filepath
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
    coverImage: coverImage?.url,
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

export default registerUser;