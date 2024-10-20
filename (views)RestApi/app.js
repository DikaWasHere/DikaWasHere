const express = require("express");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const joi = require("joi");

const app = express();
const port = 3000;
const prisma = new PrismaClient();

const users = [];

app.use(express.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // res.render('index');
  res.send(`Jumlah user ${users.length}`);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  users.push({ email, password });
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.render("index");
});

//validasi joi
app.post("/api/v1/posts4", async (req, res) => {
  const joiValidation = joi.object({
    title: joi.string().min(5).max(10).required(),
    // body: joi.number().required()
  });

  const { error } = joiValidation.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: false,
      message: error,
    });
  }

  //greet
  app.get("/greet", (req, res) => {
    const name = req.query.name || "Andika";
    res.render("greet", { name });
  });

  const post = await prisma.post.create({
    data: {
      title: req.body.title,
    },
  });

  res.status(201).json(post);
});

//categorie
app.post("/api/v1/categories", async (req, res) => {
  const createCategory = await prisma.post.create({
    data: {
      title: "How to be A Villain",
      categories: {
        create: [
          {
            assignedBy: "Bob",
            assignedAt: new Date(),
            category: {
              create: {
                name: "New Category",
              },
            },
          },
        ],
      },
    },
  });

  res.status(201).json(createCategory);
});

//post
app.post("/api/v1/posts", async (req, res) => {
  const createCategory = await prisma.post.create({
    data: {
      title: "How to be Cat",
      categories: {
        create: [
          {
            assignedBy: "Cat",
            assignedAt: new Date(),
            category: {
              connect: {
                id: 1,
              },
            },
          },
        ],
      },
    },
  });

  res.status(201).json(createCategory);
});

//posts2
app.post("/api/v1/posts2", async (req, res) => {
  const createCategory = await prisma.post.create({
    data: {
      title: "How to be Catalina",
      categories: {
        create: [
          {
            assignedBy: "Catalina",
            assignedAt: new Date(),
            category: {
              connectOrCreate: {
                where: {
                  id: 1,
                },
                create: {
                  name: "New Category",
                  id: 9,
                },
              },
            },
          },
        ],
      },
    },
  });

  res.status(201).json(createCategory);
});

//read membaca
app.get("/api/v1/posts", async (req, res) => {
  let getPosts = await prisma.post.findMany({
    where: {
      categories: {
        some: {
          category: {
            name: "New Category",
          },
        },
      },
    },
  });

  return res.json(getPosts);
});

app.get("/api/v1/categories", async (req, res) => {
  let getAssignments = await prisma.category.findMany({
    where: {
      posts: {
        some: {
          assignedBy: "Bob",
          post: {
            title: {
              contains: "How to be Bob",
            },
          },
        },
      },
    },
  });

  return res.json(getAssignments);
});

//pagination
function getPagination(req, count, limit, page) {
  const pagination = {};
  const link = {};
  const path = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

  if (count - limit * page <= 0) {
    link.next = "";
    if (page - 1 <= 0) {
      link.prev = "";
    } else {
      link.prev = `${path}?page=${page - 1}&limit=${limit}`;
    }
  } else {
    link.next = `${path}?page=${page + 1}&limit=${limit}`;

    if (page - 1 <= 0) {
      link.prev = "";
    } else {
      link.prev = `${path}?page=${page - 1}&limit=${limit}`;
    }
  }

  pagination.links = link;
  pagination.totalItems = count;

  return pagination;
}

app.post("/api/v1/users", async (req, res) => {
  const { name } = req.body; // Mengambil 'name' dari request body

  // Validasi input
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    // Membuat user baru menggunakan Prisma
    const user = await prisma.user.create({
      data: {
        name: name,
      },
    });

    // Mengirimkan respons sukses ke klien
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    // Menangani error
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// pagination
// http://localhost:3000/api/v1/posts3?page=2&pageSize=10
app.post("/api/v1/posts3", async (req, res) => {
  try {
    const post = await prisma.post.create({
      data: {
        title: req.body.title,
      },
    });

    if (post == null) {
      throw new Error("Internal server error");
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
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
