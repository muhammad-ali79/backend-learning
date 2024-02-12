import mongoose from "mongoose";
import { DB_NAME } from "../constansts.js";

const connectDB = async () => {
  try {
    // mongoose will return a response object of this connection we are storing this response in a variable
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log(
      `MONGODB connected HOST::${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to Mongodb", error);
    process.exit(1);
  }
};

export default connectDB;
