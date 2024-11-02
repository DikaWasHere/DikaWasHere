class MediaHandling {
  static handleMedia(req, res) {
    let redirectImage =
      "http://" + req.get("host") + "/images/" + req.file.filename;

    res.status(201).json({
      data: redirectImage,
    });
  }
}

module.exports = MediaHandling;
