const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const g = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  res.json(g);
});

module.exports = router;
