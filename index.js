const express = require("express");
const app = express();
require("dotenv").config();
const bookRouter = require("./routes/book.routes");
const authorRouter = require("./routes/author.routes");
const { loggerMiddleware } = require("./middlewares/logger");

const PORT = process.env.PORT;
// Middleware
app.use(express.json());

app.use(loggerMiddleware);

app.use("/books", bookRouter);
app.use("/authors", authorRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
