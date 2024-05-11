import mongoose from "mongoose";

const convertIdToString = function (id) {
  return new mongoose.Types.ObjectId(id).toString();
};

export default convertIdToString;
