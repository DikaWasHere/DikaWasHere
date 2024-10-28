const express = require("express");
const router = express.Router(); // Tambahkan baris ini untuk mendefinisikan router

// router.get("/", (req, res) => {
//   res.send("Sampai ke folder routing");
// });

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login", { user: "andika" });
});

module.exports = router;
