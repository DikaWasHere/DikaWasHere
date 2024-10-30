const express = require("express");
const router = express.Router(); // Tambahkan baris ini untuk mendefinisikan router
const AuthControllers = require("../controllers/authControllers");
const passport = require("../lib/passport");
const restrict = require("../middleware/restrict");
const restrictJwt = require("../middleware/restrictJwt");

// router.get("/", (req, res) => {
//   res.send("Sampai ke folder routing");
// });

/**
 * @swagger
 * /auth/register:
 *   get:
 *     summary: Render halaman registrasi
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Halaman registrasi EJS berhasil dirender.
 */
router.get("/auth/register", AuthControllers.renderRegisterPage);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Daftarkan pengguna baru
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Pengguna berhasil didaftarkan.
 *       400:
 *         description: Registrasi gagal karena data tidak valid.
 */
router.post("/auth/register", AuthControllers.handleRegister);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Menampilkan dashboard pengguna
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard berhasil dirender.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get("/dashboard", restrict, (req, res) => {
  console.log(req.user, "=>in coba");
  res.render("dashboard", { user: req.user });
});

/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: Render halaman login
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Halaman login EJS berhasil dirender.
 */
router.get("/auth/login", AuthControllers.renderLoginPage);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login pengguna
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil.
 *       401:
 *         description: Login gagal, kredensial tidak valid.
 */
router.post("/auth/login", AuthControllers.handleLogin);

/**
 * @swagger
 * /auth/authenticate:
 *   get:
 *     summary: Verifikasi autentikasi pengguna dengan JWT
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pengguna terautentikasi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Anda Sudah ter Authenticate"
 */
router.get("/auth/authenticate", restrictJwt, (req, res) => {
  res.status(200).json({
    message: "Anda Sudah ter Authenticate",
  });
});

module.exports = router;
