import mongoose from "mongoose";

const orderItemsSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

  qunatity: {
    type: Number,
    required: true,
  },
});

const orderSchema = mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    orderItems: {
      type: [orderSchema],
    },

    adress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED"],
      default: "PENDING",
    },
  },

  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
