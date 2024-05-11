import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },

    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },

    title: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    // we will get the duration from the cloudinary
    duration: {
      type: Number,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    // is video is public or not
    isPublished: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);
