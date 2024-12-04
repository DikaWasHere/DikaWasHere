const express = require("express");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.post("/api/v1/users", async (req, res) => {
  let name = req.body.name;
  let user = await prisma.user.create({
    data: {
      name: req.body.name,
    },
  });

  res.status(201).json(user);
});

app.get("/api/v1/users", async (req, res) => {
  let users = await prisma.user.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return res.json(users);
});

app.get("/api/v1/users/:id", async (req, res) => {
  let user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (user == null) {
    return res.status(400).json({
      message: "error adekku",
    });
  }

  return res.json(user);
});

app.put("/api/v1/users/:id", async (req, res) => {
  let name = req.body.name;

  let user = await prisma.user.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      name: name,
    },
  });

  return res.json(user);
});

app.delete("/api/v1/users/:id", async (req, res) => {
  let user = await prisma.user.delete({
    where: {
      id: Number(req.params.id),
    },
  });

  return res.json(user);
});

app.listen(port, () => console.log("Berjalan di port " + port));

//coba
