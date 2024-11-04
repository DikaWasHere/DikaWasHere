const multer = require("multer");

const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Hanya boleh PNG/JPG/JPEG");
      cb(error, false);
    }
  },
});

// // const storage = multer.diskStorage
// // const multerInvoke = multer()
exports.module = upload;
