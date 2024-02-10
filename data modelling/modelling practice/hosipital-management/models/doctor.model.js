import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      requied: true,
    },

    Salary: {
      type: String,
      requied: true,
    },

    qualifications: {
      type: String,
      requied: true,
    },

    experienceInYears: {
      type: Number,
      requied: true,
      default: 0,
    },

    worksInHospital: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
    ],
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", patientSchema);
