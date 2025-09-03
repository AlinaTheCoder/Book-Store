const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  addBook,
  deleteBoodById,
  updateBookCompletely,
  updateBookPartially,
  getAuthorName
} = require("../controllers/book.controller");

// ✅ Get all books (with optional search)
router.get("/", getAllBooks);

// ✅ Get book by ID
router.get("/:id", getBookById);

// get the Name of Books author
router.get("/:book_id/author_name",getAuthorName);

// ✅ Add a new book
router.post("/", addBook);

// ✅ Delete a book
router.delete("/:id", deleteBoodById);

// ✅ Full Update (PUT)
router.put("/:id", updateBookCompletely);

// ✅ Partial Update (PATCH)
router.patch("/:id", updateBookPartially);

module.exports = router;
