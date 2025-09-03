const db = require("../db/index");
const { bookTable: books } = require("../models/book.model");
const { authorTable: authors } = require("../models/author.model");
const { eq, ilike, sql } = require("drizzle-orm");
const { validate: isUuid } = require("uuid");
const { date } = require("drizzle-orm/mysql-core");

exports.getAllBooks = async function (req, res) {
  const search = req.query.search;
  if (search) {
    const result = await db
      .select()
      .from(books)
      .where(
        sql`to_tsvector('english', ${books.title}) @@ to_tsquery('english', ${search})`
      );
    // .where(ilike(books.title, `%${search}%`));
    if (result.length === 0) {
      res.status(404).json({
        message: `No Book Found in DB with title ${search}!`,
      });
    }
    return res.json({
      data: result,
    });
  }
  const result = await db.select().from(books);
  if (result.length === 0) {
    res.status(404).json({
      message: "No Book Found in DB!",
    });
  }
  res.json({
    data: result,
  });
};

exports.getBookById = async function (req, res) {
  try {
    const id = req.params.id;

    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }

    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.book_id, id))
      .limit(1);
    console.log(book);

    if (!book)
      return res
        .status(404)
        .json({ error: `Book with the id ${id} doesn't exist in books table` });

    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get the book",
      error: error,
    });
  }
};

exports.getAuthorName = async function (req, res) {
  const book_id = req.params.book_id;
  try {
    // valid uuid format
    if (!isUuid(book_id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    //  check that if book exists or not
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.book_id, book_id))
      .limit(1);
    // console.log(book);

    if (!book)
      return res.status(404).json({
        error: `Book with the id ${book_id} doesn't exist in books table`,
      });

    // now query to get the author name
    //  as the name of the author is an another table authors so i need to apply the join to get the author name in one query
    // const result = await db.select().from(users).innerJoin(pets, eq(users.id, pets.ownerId))

    const [authorName] = await db
      .select({ author_name: authors.name })
      .from(authors)
      .innerJoin(books, eq(authors.author_id, books.author_id))
      .where(eq(books.book_id, book_id));

    console.log(`Look Alina what's coming in Authors name: ${authorName.author_name}`);
    res.json({
      message: `Author's name Successfully got for the book_id: ${book_id}`,
      data: authorName,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to get Author Name of a book with id: ${book_id}`,
      error: error,
    });
  }
};

exports.addBook = async function (req, res) {
  try {
    const { title, genre, publication_year, author_id } = req.body;
    if (!title || !genre || !publication_year || !author_id) {
      return res.status(400).json({
        error: "title , genre , publication Year and author id is required",
      });
    }
    const [newBook] = await db
      .insert(books)
      .values({
        title,
        genre,
        publication_year,
        author_id,
      })
      .returning({ book_id: books.book_id });

    res.status(201).json({
      message: `Book created successfully with ID ${newBook.book_id} !`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Add the book",
      error: error,
    });
  }
};

//  do this Alina InshAllah
exports.deleteBoodById = async function (req, res) {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    console.log(id);

    const [result] = await db
      .delete(books)
      .where(eq(books.book_id, id))
      .returning({ book_id: books.book_id });
    console.log(`Look alina that's result returning:`, result);

    if (!result)
      return res
        .status(404)
        .json({ error: `Book with the id ${id} doesn't exist in books table` });

    res.json({
      message: `Book deleted successfully with id: ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Delete the book",
      error: error,
    });
  }
};

exports.updateBookCompletely = async function (req, res) {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    const { title, genre, publication_year } = req.body;

    if (!title || !genre || !publication_year) {
      return res.status(400).json({
        error: "Title, Genre and Publication Year are required for PUT",
      });
    }

    const [result] = await db
      .update(books)
      .set({
        title,
        genre,
        publication_year,
      })
      .where(eq(books.book_id, id))
      .returning({ id: books.book_id });

    console.log(`Look alina that's result returning:`, result);
    if (!result)
      return res.status(404).json({ error: `Book with id ${id} not found` });

    res.json({
      message: `Book updated successfully with id: ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Update the book",
      error: error,
    });
  }
};

exports.updateBookPartially = async function (req, res) {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({
        error: `Invalid uuid format ${id}`,
      });
    }
    const { title, genre, publication_year } = req.body;

    if (!title && !genre && !publication_year) {
      return res.status(400).json({
        error:
          "At least one field (title or genre or publication_year) is required",
      });
    }

    if (title) {
      const [result] = await db
        .update(books)
        .set({
          title,
        })
        .where(eq(books.book_id, id))
        .returning({ id: books.book_id });

      if (!result)
        return res.status(404).json({ error: `Book with id ${id} not found` });
    }
    if (genre) {
      const [result] = await db
        .update(books)
        .set({
          genre,
        })
        .where(eq(books.book_id, id))
        .returning({ id: books.book_id });

      if (!result)
        return res.status(404).json({ error: `Book with id ${id} not found` });
    }
    if (publication_year) {
      const [result] = await db
        .update(books)
        .set({
          publication_year,
        })
        .where(eq(books.book_id, id))
        .returning({ id: books.book_id });

      if (!result)
        return res.status(404).json({ error: `Book with id ${id} not found` });
    }

    res.json({
      message: `Book updated successfully with id ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Update the book",
      error: error,
    });
  }
};
