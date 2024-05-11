import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // getting the accessToken from the cookies or from header if the req come from a mobile app
    const token =
      req.cookies.accessToken ||
      // accessing the authorization field and just selecting the token from the value
      req.header("Authorization")?.replace("Bearer ", ""); //TODO:confrimatio on bearer

    if (!token)
      throw new ApiError(401, "Unauthorized request. Please login to continue");

    const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // console.log("user from the middleaware", user);

    if (!user) throw new ApiError(401, "Invalid Access Token");

    // adding the new property on the request
    req.user = user;

    // go to next middleware or other process
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default verifyJWT;
