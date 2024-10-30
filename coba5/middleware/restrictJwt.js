const jwt = require("jsonwebtoken");
let JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verifikasi token JWT
  jwt.verify(authorization, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Jika token valid, simpan informasi pengguna yang terdekode
    console.log(decoded, "=> INI HASIL DECODE");
    req.user = decoded;
    next();
  });
};
