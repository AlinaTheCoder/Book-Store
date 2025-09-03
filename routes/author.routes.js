const express = require("express");
const router = express.Router();
const {
  getAllAuthors,
  getAuthorById,
  addAuthor,
  deleteAuthorById,
  updateAuthorCompletely,
  updateAuthorPartially,
  getAllBooksByAuthor,
} = require("../controllers/author.controller");

// ✅ Get all authors
router.get("/", getAllAuthors);

// ✅ Get author by ID
router.get("/:id", getAuthorById);

// ✅ Get All Books By Author
router.get("/:id/books", getAllBooksByAuthor);

// ✅ Add a new author
router.post("/", addAuthor);

// ✅ Delete an author
router.delete("/:id", deleteAuthorById);

// ✅ Full Update (PUT)
router.put("/:id", updateAuthorCompletely);

// ✅ Partial Update (PATCH)
router.patch("/:id", updateAuthorPartially);

module.exports = router;
