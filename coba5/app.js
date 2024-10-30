require("dotenv").config();
const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("express-flash");
const authRoutes = require("./routes/index"); // Mengimpor rute dari index.js
const passport = require("./lib/passport");

const port = process.env.PORT || 3000; // Atur port
const prisma = new PrismaClient();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("dev"));
app.use(flash());

// Menggunakan rute dari index.js
app.use("/", authRoutes);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Basic Banking API",
      version: "1.0.0",
      description: "API untuk sistem perbankan sederhana",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./routes/*.js", "./app.js"], // Sesuaikan jalur untuk mencakup semua rute
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Membuat user baru beserta profilnya
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               identityType:
 *                 type: string
 *               identityNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Terjadi kesalahan saat membuat user
 */
app.post("/api/v1/users", async (req, res) => {
  const { name, email, password, identityType, identityNumber, address } =
    req.body;

  // Validasi input
  if (
    !name ||
    !email ||
    !password ||
    !identityType ||
    !identityNumber ||
    !address
  ) {
    return res.status(400).json({
      error: "Semua field harus diisi",
    });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Format email tidak valid",
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        profile: {
          create: {
            identityType,
            identityNumber,
            address,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    // Handling specific errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email sudah terdaftar",
      });
    }

    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Membuat akun bank baru untuk user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               bankAccountNumber:
 *                 type: string
 *               balance:
 *                 type: number
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Akun berhasil dibuat
 *       400:
 *         description: Terjadi kesalahan saat membuat akun
 */
app.post("/api/v1/accounts", async (req, res) => {
  const { bankName, bankAccountNumber, balance, userId } = req.body;
  const bankAccount = await prisma.bankAccount.create({
    data: {
      bankName: bankName,
      bankAccountNumber: bankAccountNumber,
      balance: balance,
      userId: userId,
    },
  });
  res.status(201).json(bankAccount);
});

/**
 * @swagger
 * /api/v1/transfers:
 *   post:
 *     summary: Membuat transfer antar akun
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               sourceAccountId:
 *                 type: integer
 *               destinationAccountId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transfer berhasil dilakukan
 *       400:
 *         description: Terjadi kesalahan saat transfer
 */
app.post("/api/v1/transfers", async (req, res) => {
  const { amount, sourceAccountId, destinationAccountId } = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: sourceAccountId },
      });
      if (!sourceAccount) throw new Error("akun tidak ditemukan");
      if (sourceAccount.balance < amount) throw new Error("kekurangan saldo");

      const destinationAccount = await prisma.bankAccount.findUnique({
        where: { id: destinationAccountId },
      });
      if (!destinationAccount)
        throw new Error("akun yang dituju tidak ditemukan");

      const updatedSourceAccount = await prisma.bankAccount.update({
        where: { id: sourceAccountId },
        data: { balance: sourceAccount.balance - amount },
      });
      const updatedDestinationAccount = await prisma.bankAccount.update({
        where: { id: destinationAccountId },
        data: { balance: destinationAccount.balance + amount },
      });

      const transfer = await prisma.transfer.create({
        data: {
          amount: amount,
          sourceAccountId: sourceAccountId,
          destinationAccountId: destinationAccountId,
        },
      });
      return {
        transfer,
        sourceAccount: updatedSourceAccount,
        destinationAccount: updatedDestinationAccount,
      };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Menampilkan semua user
 *     responses:
 *       200:
 *         description: Daftar user
 */
app.get("/api/v1/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  res.json(users);
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Menampilkan detail user berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail user ditemukan
 *       404:
 *         description: User tidak ditemukan
 */
app.get("/api/v1/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { profile: true, bankAccounts: true },
  });
  if (!user)
    return res
      .status(404)
      .json({ message: `User dengan id ${req.params.id} tidak ditemukan.` });
  res.json(user);
});

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Menampilkan semua akun bank
 *     responses:
 *       200:
 *         description: Daftar akun bank
 */
app.get("/api/v1/accounts", async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      select: {
        id: true,
        bankName: true,
        user: { select: { name: true } },
      },
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Menampilkan detail akun berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail akun ditemukan
 *       404:
 *         description: Akun tidak ditemukan
 */
app.get("/api/v1/accounts/:accountId", async (req, res) => {
  const accountId = parseInt(req.params.accountId);
  try {
    const account = await prisma.bankAccount.findUnique({
      where: { id: accountId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!account)
      return res.status(404).json({ error: "akun tidak ditemukan" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Menampilkan semua transaksi
 *     responses:
 *       200:
 *         description: Daftar transaksi
 */
app.get("/api/v1/transactions", async (req, res) => {
  try {
    const transactions = await prisma.transfer.findMany({
      orderBy: { id: "desc" },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Menampilkan detail transaksi berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail transaksi ditemukan
 *       404:
 *         description: Transaksi tidak ditemukan
 */
app.get("/api/v1/transactions/:transactionId", async (req, res) => {
  const transactionId = parseInt(req.params.transactionId);
  try {
    const transaction = await prisma.transfer.findUnique({
      where: { id: transactionId },
      include: {
        sourceAccount: {
          select: {
            bankAccountNumber: true,
            bankName: true,
            user: { select: { name: true, email: true } },
          },
        },
        destinationAccount: {
          select: {
            bankAccountNumber: true,
            bankName: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!transaction)
      return res.status(404).json({ error: "transaksi tidak ditemukan" });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
  });
}

module.exports = app;
