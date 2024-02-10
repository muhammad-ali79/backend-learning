// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({ path: "./env" });
connectDB();

/*
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => console.log("ERROR connecting the app", error));

    app.listen(
      process.env.PORT,
      () => `app is listening at ${process.env.PORT}`,
    );
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
})();
*/
