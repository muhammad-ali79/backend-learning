import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      // cloudinary will figure will out by his own that what type of file is upload
      resource_type: "auto",
    });

    console.log("File is uploaded on cloudinary successfully", response.url);
    console.log("RESPONSE", response);

    return response;
  } catch (error) {
    // if upload operation got failed then remove the file from the server
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export default uploadOnCloudinary;
