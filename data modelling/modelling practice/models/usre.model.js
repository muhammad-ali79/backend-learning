import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },

    password: {
      type: String,

      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
