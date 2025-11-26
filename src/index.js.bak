require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authorsRouter = require("./routes/authors");
const booksRouter = require("./routes/books");
app.use("/api/genres", require("./routes/genres"));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/authors", authorsRouter);
app.use("/api/books", booksRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

