class MediaHandling {
  static handleMedia(req, res) {
    let redirectImage =
      "http://" + req.get("host") + "/images/" + req.file.filename;

    res.status(201).json({
      data: redirectImage,
    });
  }
  static handleMoreImage(req, res) {
    console.log(req.files);

    if (req.files.length === 0) {
      res.status(400).json({
        message: "Bad Request",
        error: "Silahkan tambahkan minimal 1 gambar",
      });
    }

    let imageUrls = req.files.map((file) => {
      return `http://${req.get("host")}/images/${file.filename}`;
    });

    res.status(200).json({
      data: {
        imageUrls,
      },
    });
  }
  static handleVideo(req, res) {
    let redirectImage =
      "http://" + req.get("host") + "/videos/" + req.file.filename;

    res.status(201).json({
      data: redirectImage,
    });
  }
}

module.exports = MediaHandling;
