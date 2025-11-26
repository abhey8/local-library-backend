const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/books - list books with author and genres
router.get("/", async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true, genres: { include: { genre: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/books/:id - book detail (instances & genres)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true, instances: true, genres: { include: { genre: true } } }
    });
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/books - create a new book
// Expected JSON body:
// {
//   "title": "My Book",
//   "summary": "Short summary",
//   "isbn": "978...",
//   "authorId": 1,
//   "genreIds": [1,2],           // optional - array of existing genre ids
//   "instances": [               // optional - array of instances
//     { "imprint": "1st ed.", "status": "Available", "dueBack": null }
//   ]
// }
router.post("/", async (req, res) => {
  const { title, summary, isbn, authorId, genreIds = [], instances = [] } = req.body;

  if (!title || !isbn || !authorId) {
    return res.status(400).json({ error: "Missing required fields: title, isbn, authorId" });
  }

  try {
    // verify author exists
    const author = await prisma.author.findUnique({ where: { id: Number(authorId) } });
    if (!author) return res.status(400).json({ error: "Invalid authorId" });

    // verify genres exist (if provided)
    if (genreIds.length) {
      const found = await prisma.genre.findMany({ where: { id: { in: genreIds.map(n => Number(n)) } } });
      if (found.length !== genreIds.length) {
        return res.status(400).json({ error: "One or more genreIds are invalid" });
      }
    }

    // build nested create payload
    const data = {
      title,
      summary: summary || null,
      isbn,
      author: { connect: { id: Number(authorId) } },
      instances: instances.length ? { create: instances.map(i => ({
        imprint: i.imprint || null,
        status: i.status || "Available",
        dueBack: i.dueBack ? new Date(i.dueBack) : null
      })) } : undefined,
      genres: genreIds.length ? { create: genreIds.map(gid => ({ genre: { connect: { id: Number(gid) } } })) } : undefined
    };

    const book = await prisma.book.create({ data, include: { author: true, instances: true, genres: { include: { genre: true } } } });
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      // unique constraint, e.g., isbn unique
      return res.status(400).json({ error: "Duplicate entry (maybe isbn already exists)" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
