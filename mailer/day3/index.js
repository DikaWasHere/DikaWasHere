const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const crypto = require("crypto");

app.use(express.json());

const users = [];

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "andika.pw2634@gmail.com",
    pass: "",
  },
});

// Endpoint untuk pendaftaran user
app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nama dan email wajib diisi" });
  }

  const activationToken = crypto.randomBytes(20).toString("hex");

  const user = { name, email, isActive: false, activationToken };
  users.push(user);

  const activationLink = `http://localhost:3000/activate?token=${activationToken}`;
  const mailOptions = {
    from: "andika.pw2634@gmail.com",
    to: email, // Mengirimkan email ke user yang mendaftar
    subject: "Aktivasi Akun",
    text: `Halo ${name},\n\nKlik link berikut untuk mengaktifkan akun Anda:\n${activationLink}\n\nSalam,\nTim Elysia`,
    html: `<p>Halo <b>${name}</b>,</p><p>Klik link berikut untuk mengaktifkan akun Anda:</p><a href="${activationLink}">${activationLink}</a><p>Salam,<br>Tim Kami</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Pendaftaran berhasil. Email konfirmasi telah dikirim.",
    });
  } catch (error) {
    console.error(error, "==> Gagal mengirim email konfirmasi");
    res.status(500).json({
      message: "Pendaftaran berhasil, tetapi gagal mengirim email konfirmasi.",
    });
  }
});

app.get("/activate", (req, res) => {
  const { token } = req.query;

  const user = users.find((u) => u.activationToken === token);

  if (!user) {
    return res.status(400).json({ message: "Token aktivasi tidak valid" });
  }

  user.isActive = true;

  res
    .status(200)
    .json({ message: `Akun ${user.name} telah berhasil diaktifkan!` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
