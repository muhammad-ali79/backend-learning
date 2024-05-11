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

    // delete file synchronously at given path
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // if upload operation got failed then remove the file from the server
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const updateCloudinaryAsset = async (localFilePath, public_id) => {
  try {
    if (localFilePath && public_id) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        public_id: public_id,
        overwrite: true,
      });

      console.log("File is updated successfully", response.url);
      fs.unlinkSync(localFilePath);
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// i made this function to delete multiple same type of assets
// so i will keep refrence of the deleted assets in an array
// and will directly give refrence if there only one thing to delete.
const deleteCloudinaryAssets = async (assetsPublicId, assetType) => {
  try {
    // if resource type is not specified for vidoes and other than images then we will get error
    cloudinary.api
      .delete_resources([...assetsPublicId], { resource_type: assetType })
      .then((result) => console.log(result));
  } catch (error) {
    console.error("Error deleting the assets", error.message);
    throw new Error("Failed to delete assets from cloudinary");
  }
};

export default uploadOnCloudinary;
export { updateCloudinaryAsset, deleteCloudinaryAssets };
