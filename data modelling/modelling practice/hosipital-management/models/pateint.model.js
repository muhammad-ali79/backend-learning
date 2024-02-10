import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      requied: true,
    },

    age: {
      type: Number,
      requied: true,
    },

    diagnosedWith: {
      type: String,
      requied: true,
    },

    gender: {
      type: String,
      enum: ["M", "F"],
      requied: true,
    },

    bloodGroup: {
      type: String,
      requied: true,
    },

    admittedIn: {
      type: mongoose.model.Types.ObjectId,
      ref: "Hospital",
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
