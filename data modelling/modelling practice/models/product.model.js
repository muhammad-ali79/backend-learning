import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requied: true,
    },

    description: {
      type: String,
      requied: true,
    },

    productImage: {
      // we should not be store the imaes , videos in the database for this we use the thrid party  servies we only store the public url of image in database
      type: String,
    },

    price: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },

    catagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "catagory",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
