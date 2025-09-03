// define the schema for book
const {
  pgTable,
  uuid,
  varchar,
  integer,
  index,
} = require("drizzle-orm/pg-core");

const { sql } = require("drizzle-orm");
const { authorTable: authors } = require("./author.model");

const bookTable = pgTable(
  "books",
  {
    book_id: uuid("book_id").primaryKey().defaultRandom(),
    title: varchar({ length: 200 }).notNull(),
    genre: varchar({ length: 200 }).notNull(),
    publication_year: integer().notNull(),
    // foriegn key references authors table
    author_id: uuid()
      .references(() => authors.author_id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    index("title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.title})`
    ),
  ]
);

module.exports = { bookTable };
