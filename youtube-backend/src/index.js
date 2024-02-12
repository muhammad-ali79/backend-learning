// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });
connectDB()
  .then(
    () =>
      app.listen(process.env.PORT || 4000, () =>
        console.log(`server is running at Port ${process.env.PORT}`)
      ),

    app.on("error", (error) =>
      console.log("Error connecting to the server", error)
    )
  )
  .catch((error) => console.error("Error connecting to MONGODB", error));

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
