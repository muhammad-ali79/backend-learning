import multer from "multer";

// storing the uploaded files on the disk of the server where your Node.js application is running (in development it is our pc)
const storage = multer.diskStorage({
  // at which dest we want to store file
  destination: (req, file, cb) => cb(null, "./public/temp"),

  // specfiying the filename of the uploaded file
  filename: (req, file, cb) => cb(null, file.originalname), // here originalnameis not recommended because user can upload the files of same name so always perfor some uniuquens from our side
});

export const upload = multer({ storage });
