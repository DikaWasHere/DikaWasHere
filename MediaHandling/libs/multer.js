const multer = require("multer");
const path = require("path");

const generateStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `public/${destination}`);
    },
    filename: (req, file, cb) => {
      let newName = Date.now() + path.extname(file.originalname);
      cb(null, newName);
    },
  });
};

module.exports = {
  image: multer({
    storage: generateStorage("images"),
    fileFilter: (req, file, cb) => {
      const allowedType = ["image/jpeg", "image/jpg", "image/png"];

      if (allowedType.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const err = new Error("Hey ga boleh selsain PNG dan JPG yaa");
        cb(err, false);
      }
    },
  }),
  onError: (err, next) => {
    next(err);
  },
  videos: multer({
    storage: generateStorage("videos"),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["video/mp4", "video/quicktime"];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const err = new Error("Hey ga boleh selain MP4 dan Quictime yaa");
        cb(err, false);
      }
    },
    onError: (err, next) => {
      next(err);
    },
  }),
};
