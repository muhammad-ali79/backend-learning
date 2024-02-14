import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      // if we want to apply search on a field then it is recommned to do index === true
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // cloudinary url
      required: true,
    },

    coverImage: {
      type: String, // cloudinary url
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        // referencing the video model
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "password is required"],
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// before saving data if password is modified then encrypt password
userSchema.pre("save", async function (next) {
  // next() essentially acts as a way to pass control to the next function in the middleware chain or to continue with the operation being performed. If you don't call next(), the middleware chain will be halted, and the save operation (or any subsequent middleware) won't proceed.

  // using next() will look like something when the next() is called then we are telling the mongoose to go to the next middleware or perfroms others operations
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// if user given password is same as password store in db then return true
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      // this id come from database
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      // this id come from database
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
