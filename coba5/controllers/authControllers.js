const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

class AuthControllers {
  static renderRegisterPage(req, res) {
    res.render("register");
  }

  static renderLoginPage(req, res) {
    res.render("login");
  }

  static async handleRegister(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validasi input
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "All fields are required",
          message: "Bad Request",
          status: false,
        });
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format",
          message: "Bad Request",
          status: false,
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Email already exists",
          message: "Bad Request",
          status: false,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      res.status(201).json({
        message: "Created Success",
        data: newUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while processing your request.",
        status: false,
      });
    }
  }

  static async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      const userData = await prisma.user.findUnique({
        where: { email },
      });

      if (!userData) {
        return res.status(404).json({
          message: "Not Found",
          error: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Bad Request",
          error: "Invalid email or password",
        });
      }

      const accessToken = jwt.sign(
        {
          name: userData.name,
          id: userData.id,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        message: "Success",
        accessToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while processing your request.",
        status: false,
      });
    }
  }
}

module.exports = AuthControllers;
