const express = require("express");
const router = express.Router(); // Tambahkan baris ini untuk mendefinisikan router
const AuthControllers = require("../controllers/authControllers");
const passport = require("../lib/passport");
const restrict = require("../middleware/restrict");

// router.get("/", (req, res) => {
//   res.send("Sampai ke folder routing");
// });
const app = express();
// ini untuk routing register
// buatin yang pertama untuk render ejs nya
router.get("/register", AuthControllers.renderRegisterPage);

// ini untuk handle inputan tag form dari html
router.post("/register", AuthControllers.handleRegister);

router.get("/dashboard", restrict, (req, res) => {
  console.log(req.user, "=>in coba");

  res.render("dashboard"), { user: req.user };
});

// ini untuk routing login
// buatin yang pertama untuk login render ejs nya
router.get("/login", AuthControllers.renderLoginPage);

router.post("/login", AuthControllers.handleLogin);

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/dashboard",
//     failureRedirect: "/login",
//   })
// );

module.exports = router;
