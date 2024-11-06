const router = require("express").Router();
const storage = require("../libs/multer");
const MediaHandling = require("../controllers/mediaHandling");

// // const express = require('express');
// // const routes = express.Router();
// router.get('/coba', (req, res) => {
//   res.send('masuk ke folder routes');
// });

router.post("/image", storage.image.single("image"), MediaHandling.handleMedia);
router.post(
  "/post-images",
  storage.image.array("image", 5),
  MediaHandling.handleMoreImage
);

router.post(
  "/add-video",
  storage.videos.single("video"),
  MediaHandling.handleVideo
);
module.exports = router;
