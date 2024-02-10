import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdBy: {
      // giving the reference of the user
      // type will be same as what we ar giving reference
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTodos: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubTodos" }],
  },
  { timeseries: true }
);

export const Todo = mongoose.model("Todo", todoSchema);
