import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    adress: {
      type: String,
      required: true,
    },

    noOfDoctors: {
      type: Number,
    },

    specializedIn: [{ type: String }],
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);
