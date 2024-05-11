import mongoose from "mongoose";
import ApiError from "./apiError.js";
import convertIdToString from "./convertIdToString.js";

const loggedInUser = function (req, id = null, message = null) {
  const user = req.user?._id;
  if (!user) throw new ApiError(401, "Please Login to continue");

  const userId = convertIdToString(user._id);

  if (id) {
    if (userId !== id) throw new ApiError(403, `${message}}`);
  }

  return user;
};

export default loggedInUser;
