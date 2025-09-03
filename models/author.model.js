const { pgTable, uuid, varchar, text } = require("drizzle-orm/pg-core");

const authorTable = pgTable("authors", {
  author_id: uuid("author_id").primaryKey().defaultRandom(),
  name: varchar({ length: 150 }).notNull(),
  biography: text(),
});

module.exports = { authorTable };
