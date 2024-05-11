import { isValidObjectId } from "mongoose";
import ApiError from "../utils/apiError.js";

const validateId = (req, res, next) => {
  const ids = Object.values(req.params);

  for (const id of ids) {
    // isValidObjectid only check for 24 character Hex String and some other internal structure
    // it is not most robouts solution for validating all incorrect ids
    if (!isValidObjectId(id)) next(new ApiError(400, "Invalid ID format"));
  }

  next();
};
export default validateId;
