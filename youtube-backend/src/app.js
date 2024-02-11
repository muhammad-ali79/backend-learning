import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// we use the .use for configrations and middelware related stuff
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

// here we are configring that in which format and where is the data is coming from
// here we are specifying the limit for json(data come from when froms, api's etc) to only 16kb
app.use(express.json({ limit: "16kb" }));

// here we are adding the middleware to parse the data that come from the url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// here we are adding the middleware to server static files in  public directory it makes these files accessible from the root URL of the server.
app.use(express.static("public"));

// here we are adding the cookieparser middleware that handle the cookies related stuff
app.use(cookieParser());

export default app;
