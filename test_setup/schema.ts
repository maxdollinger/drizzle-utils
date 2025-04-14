import { relations } from "drizzle-orm";
import { integer, text, pgTable, timestamp, AnyPgColumn } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
});

export const usersRelations = relations(userTable, ({ many }) => ({
    posts: many(postTable),
}));

export const postTable = pgTable("post", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    content: text("content").notNull(),
    authorId: integer("author_id")
        .notNull()
        .references((): AnyPgColumn => userTable.id),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
});

export const postsRelations = relations(postTable, ({ one }) => ({
    author: one(userTable, {
        fields: [postTable.authorId],
        references: [userTable.id],
    }),
}));

export const schema = {
    users: userTable,
    post: postTable,
};
