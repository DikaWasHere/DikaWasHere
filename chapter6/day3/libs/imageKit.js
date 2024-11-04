const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

module.exports = imagekit;
