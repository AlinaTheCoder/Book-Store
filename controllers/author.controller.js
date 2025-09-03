const db = require("../db/index");
const { authorTable: authors } = require("../models/author.model");
const { bookTable: books } = require("../models/book.model");
const { eq, ilike, sql } = require("drizzle-orm");
const { validate: isUuid } = require("uuid");

exports.getAllAuthors = async function (req, res) {
  console.log("inside get all authors");

  const result = await db.select().from(authors);
  if (result.length === 0) {
    res.status(404).json({
      message: "No Author Found in DB!",
    });
  }
  res.json({
    data: result,
  });
};

exports.getAuthorById = async function (req, res) {
  try {
    const id = req.params.id;

    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }

    const [Author] = await db
      .select()
      .from(authors)
      .where(eq(authors.author_id, id))
      .limit(1);
    console.log(Author);

    if (!Author)
      return res.status(404).json({
        error: `Author with the id ${id} doesn't exist in Authors table`,
      });

    res.json(Author);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get the Author",
      error: error,
    });
  }
};

exports.getAllBooksByAuthor = async function (req, res) {
  console.log("inside get books by author");

  try {
    const id = req.params.id;

    // check if author exists
    const [authorExist] = await db
      .select()
      .from(authors)
      .where(eq(authors.author_id, id));

    if (!authorExist) {
      return res.status(404).json({
        message: `Author doesn't exist in db with id ${id}`,
      });
    }

    // fetch all books by that author
    const result = await db
      .select({ title: books.title })
      .from(books)
      .where(eq(books.author_id, id));

    if (result.length === 0) {
      return res.status(404).json({
        message: `No books found for author with id ${id}`,
      });
    }
    res.json({
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to get All the Books by Author with id ${req.params.id}`,
      error: error.message,
    });
  }
};

exports.addAuthor = async function (req, res) {
  try {
    const { name, biography } = req.body;
    if (!name) {
      return res.status(400).json({
        error: "name of author is required",
      });
    }
    const [newAuthor] = await db
      .insert(authors)
      .values({
        name,
        biography,
      })
      .returning({ Author_id: authors.author_id });

    res.status(201).json({
      message: `Author created successfully with ID ${newAuthor.Author_id} !`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Add the Author",
      error: error,
    });
  }
};

//  do this Alina InshAllah
exports.deleteAuthorById = async function (req, res) {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    // console.log(id);

    const [result] = await db
      .delete(authors)
      .where(eq(authors.author_id, id))
      .returning({ author_id: authors.author_id });
    console.log(`Look alina that's result returning:`, result);

    if (!result)
      return res.status(404).json({
        error: `Author with the id ${id} doesn't exist in Authors table`,
      });

    res.json({
      message: `Author deleted successfully with id: ${result.author_id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Delete the Author",
      error: error,
    });
  }
};

exports.updateAuthorCompletely = async function (req, res) {
  try {
    const id = req.params.id.trim();
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    const { name, biography } = req.body;

    if (!name || !biography) {
      return res.status(400).json({
        error: "Author's name, and Biography both are required for PUT",
      });
    }

    const [result] = await db
      .update(authors)
      .set({
        name,
        biography,
      })
      .where(eq(authors.author_id, id))
      .returning({ id: authors.author_id });

    console.log(`Look alina that's result returning:`, result);
    if (!result)
      return res.status(404).json({ error: `Author with id ${id} not found` });

    res.json({
      message: `Author updated successfully with id: ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Update the Author",
      error: error,
    });
  }
};

exports.updateAuthorPartially = async function (req, res) {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    const { name, biography } = req.body;

    if (!name && !biography) {
      return res.status(400).json({
        error: "At least one field (name or biography) is required",
      });
    }

    if (name) {
      const [result] = await db
        .update(authors)
        .set({
          name,
        })
        .where(eq(authors.author_id, id))
        .returning({ id: authors.author_id });

      if (!result)
        return res
          .status(404)
          .json({ error: `Author with id ${id} not found` });
    }
    if (biography) {
      const [result] = await db
        .update(authors)
        .set({
          biography,
        })
        .where(eq(authors.author_id, id))
        .returning({ id: authors.author_id });

      if (!result)
        return res
          .status(404)
          .json({ error: `Author with id ${id} not found` });
    }

    res.json({
      message: `Author updated successfully with id ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Update the Author",
      error: error,
    });
  }
};
