const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      let uploadPath;

      // Check if the request is for venue images or profile images
      if (req.baseUrl.includes("venue")) {
          uploadPath = path.join(__dirname, "../public/uploads/venues/");
      } else {
          uploadPath = path.join(__dirname, "../public/uploads/"); // Default for profile images
      }

      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Assign unique name
  }
});


const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
  
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  };


  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
  });
  
  module.exports = upload;