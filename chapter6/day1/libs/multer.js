const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    console.log(file, "=> INI FILE YANG DI UPLOAD");
    let newName = Date.now() + path.extname(file.originalname);
    cb(null, newName);
  },
});

module.exports = {
  image: multer({ storage: storage }),
};
