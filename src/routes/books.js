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

module.exports = router;
