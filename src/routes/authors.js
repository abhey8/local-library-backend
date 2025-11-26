const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/authors - list all authors (with basic book count)
router.get("/", async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      include: { books: { select: { id: true } } },
      orderBy: { familyName: "asc" }
    });

    const out = authors.map(a => ({
      id: a.id,
      firstName: a.firstName,
      familyName: a.familyName,
      dateOfBirth: a.dateOfBirth,
      dateOfDeath: a.dateOfDeath,
      bookCount: a.books.length
    }));

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/authors/:id - author detail
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            genres: { include: { genre: true } },
            instances: true
          }
        }
      }
    });

    if (!author) return res.status(404).json({ error: "Not found" });

    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
