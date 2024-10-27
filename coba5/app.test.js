const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("./app"); // Pastikan export app dari file app.js
const prisma = new PrismaClient();

// Reset database sebelum setiap test
beforeEach(async () => {
  await prisma.$transaction([
    prisma.transfer.deleteMany(),
    prisma.bankAccount.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

describe("Banking API Integration Tests", () => {
  describe("User API", () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      identityType: "KTP",
      identityNumber: "1234567890",
      address: "Jakarta",
    };

    test("should create a new user", async () => {
      const response = await request(app).post("/api/v1/users").send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.identityNumber).toBe(
        userData.identityNumber
      );
    });

    test("should get all users", async () => {
      // Create user first
      await request(app).post("/api/v1/users").send(userData);

      const response = await request(app).get("/api/v1/users");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("Bank Account API", () => {
    let userId;

    beforeEach(async () => {
      // Create a user first
      const userResponse = await request(app).post("/api/v1/users").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        identityType: "KTP",
        identityNumber: "1234567890",
        address: "Jakarta",
      });
      userId = userResponse.body.id;
    });

    test("should create a bank account", async () => {
      const accountData = {
        bankName: "Test Bank",
        bankAccountNumber: "1234567890",
        balance: 1000,
        userId: userId,
      };

      const response = await request(app)
        .post("/api/v1/accounts")
        .send(accountData);

      expect(response.status).toBe(201);
      expect(response.body.bankName).toBe(accountData.bankName);
      expect(response.body.balance).toBe(accountData.balance);
    });

    test("should get all accounts", async () => {
      // Create account first
      await request(app).post("/api/v1/accounts").send({
        bankName: "Test Bank",
        bankAccountNumber: "1234567890",
        balance: 1000,
        userId: userId,
      });

      const response = await request(app).get("/api/v1/accounts");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("Transfer API", () => {
    let sourceAccountId;
    let destinationAccountId;

    beforeEach(async () => {
      // Create a user
      const userResponse = await request(app).post("/api/v1/users").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        identityType: "KTP",
        identityNumber: "1234567890",
        address: "Jakarta",
      });
      const userId = userResponse.body.id;

      // Create source account
      const sourceAccount = await request(app).post("/api/v1/accounts").send({
        bankName: "Source Bank",
        bankAccountNumber: "1234567890",
        balance: 1000,
        userId: userId,
      });
      sourceAccountId = sourceAccount.body.id;

      // Create destination account
      const destAccount = await request(app).post("/api/v1/accounts").send({
        bankName: "Destination Bank",
        bankAccountNumber: "0987654321",
        balance: 0,
        userId: userId,
      });
      destinationAccountId = destAccount.body.id;
    });

    test("should create a transfer", async () => {
      const transferData = {
        amount: 500,
        sourceAccountId: sourceAccountId,
        destinationAccountId: destinationAccountId,
      };

      const response = await request(app)
        .post("/api/v1/transfers")
        .send(transferData);

      expect(response.status).toBe(201);
      expect(response.body.transfer.amount).toBe(transferData.amount);
      expect(response.body.sourceAccount.balance).toBe(500); // 1000 - 500
      expect(response.body.destinationAccount.balance).toBe(500); // 0 + 500
    });

    test("should not allow transfer with insufficient balance", async () => {
      const transferData = {
        amount: 1500, // More than available balance
        sourceAccountId: sourceAccountId,
        destinationAccountId: destinationAccountId,
      };

      const response = await request(app)
        .post("/api/v1/transfers")
        .send(transferData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("kekurangan saldo");
    });

    test("should get all transactions", async () => {
      // Create a transfer first
      await request(app).post("/api/v1/transfers").send({
        amount: 500,
        sourceAccountId: sourceAccountId,
        destinationAccountId: destinationAccountId,
      });

      const response = await request(app).get("/api/v1/transactions");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

test("should create a new user", async () => {
  const userData = {
    name: "andika",
    email: "andika@mail.com",
    password: "pass",
    identityType: "KTP",
    identityNumber: "9876543210",
    address: "Bandung",
  };

  const response = await request(app).post("/api/v1/users").send(userData);

  expect(response.status).toBe(201); // Misalnya status 201 untuk created
  expect(response.body.name).toBe(userData.name);
  expect(response.body.email).toBe(userData.email);
  expect(response.body.profile).toBeDefined();
  expect(response.body.profile.identityNumber).toBe(userData.identityNumber);
});

afterAll(async () => {
  await prisma.$disconnect();
});
