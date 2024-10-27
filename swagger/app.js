const express = require("express");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const joi = require("joi");
const app = express();

const { swaggerUi, swaggerSpec } = require("./swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json());
app.set("view engine", "ejs");

// const port = 3000;
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const users = [];

app.get("/", (req, res) => {
  // res.render('index');
  res.send(`Jumlah user ${users.length}`);
});

app.get("/registersss", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  users.push({ email, password });
  //
  // const user = prisma.user.create({
  //     data: {
  //         email: email,
  //         password: password
  //     },
  // });
  //
  res.redirect("/");
});

app.get("/api/v1/greet", (req, res) => {
  const name = req.query.name || "Jensen";

  res.render("greet", { name });
});

app.get("/api/v1/gettt", async (req, res) => {
  const bebas = {
    a: "abc",
    b: "def",
  };

  const { a } = bebas;

  console.log(`a adalah ${a}`); // abc

  res.status(200).json({
    message1: a,
  });
});

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

  const post = await prisma.post.create({
    data: {
      title: req.body.title,
    },
  });

  res.status(201).json(post);
});

app.post("/api/v1/posts3", async (req, res) => {
  try {
    const post = await prisma.post.create({
      data: {
        title: req.body.title,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
});

app.post("/api/v1/categories", async (req, res) => {
  const createCategory = await prisma.post.create({
    data: {
      title: req.body.title,
      categories: {
        create: [
          {
            assignedBy: req.body.assignedBy,
            assignedAt: new Date(),
            category: {
              create: {
                name: req.body.category,
              },
            },
          },
        ],
      },
    },
  });

  res.status(201).json(createCategory);
});

app.post("/api/v1/posts", async (req, res) => {
  const createCategory = await prisma.post.create({
    data: {
      title: "How to be Bob",
      categories: {
        create: [
          {
            assignedBy: "Bob",
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

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Example route
 *     tags:
 *       - Example
 *     responses:
 *       200:
 *         description: Returns an example message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is an example route!
 */
app.get("/example", (req, res) => {
  res.json({ message: "This is an example route!" });
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *       500:
 *         description: Internal server error
 */
app.get("/api/v1/users", async (req, res) => {
  try {
    let users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching users." });
  }
});

// routes/api/v1/posts.js
/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: api/v1/posts route
 *     responses:
 *       200:
 *         description: get all posts
 */
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

// pagination
// http://localhost:3000/api/v1/posts3?page=2&pageSize=10
app.get("/api/v1/posts3", async (req, res) => {
  let page = Number(req.query.page) || 1;
  let pageSize = Number(req.query.pageSize) || 10;

  const posts = await prisma.post.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalPosts = await prisma.post.count();

  res.json({
    data: posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / pageSize),
    totalPosts: totalPosts,
  });
});

app.get("/api/v1/users/:id", async (req, res) => {
  let user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (user == null) {
    return res.status(400).json({
      message: `id ${req.params.id} not found in database`,
    });
  }

  return res.status(200).json(user);
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
  let user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (user == null) {
    return res.status(400).json({
      message: `id ${req.params.id} not found in database`,
    });
  } else {
    user = await prisma.user.delete({
      where: {
        id: Number(req.params.id),
      },
    });
  }

  return res.json(user);
});

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

// Swagger setup
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route to homepage
app.get("/", (req, res) => {
  res.send(`Jumlah user ${users.length}`);
});

// Register user route
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  users.push({ email, password });
  res.redirect("/");
});

// Get users (Swagger documented)
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *       500:
 *         description: Internal server error
 */
app.get("/api/v1/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching users." });
  }
});

// Swagger Example route
/**
 * @swagger
 * /example:
 *   get:
 *     summary: Example route
 *     tags:
 *       - Example
 *     responses:
 *       200:
 *         description: Example response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This is an example route!"
 */
app.get("/example", (req, res) => {
  res.json({ message: "This is an example route!" });
});

app.listen(port, () => console.log(`Berjalan di port ${port}`));
