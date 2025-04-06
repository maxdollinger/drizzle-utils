import { describe, test, expect } from "vitest";
import { getDB } from "../test_setup/db";
import { postTable, userTable } from "../test_setup/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { jsonAgg, jsonBuildObject } from "./json";
import { asc } from "drizzle-orm";
import { findFirst } from "./findHelper";
import { currentTimestamp } from "./timeHelper";

describe("jsonBuildObject", async () => {
  const { db, seed } = await getDB();

  test("should accept a column as value", async () => {
    const results = await db
      .select({ userId: userTable.id, postsIds: jsonAgg(postTable.id) })
      .from(userTable)
      .leftJoin(postTable, eq(userTable.id, postTable.authorId))
      .groupBy(userTable.id);

    expect(results[0]?.postsIds).toEqual(seed[0]?.posts.map((p) => p.id));
  });

  test("should map timestamp from column properly", async () => {
    const user = await findFirst(
      db
        .select({ userId: userTable.id, posts: jsonAgg(postTable.createdAt) })
        .from(userTable)
        .where(eq(userTable.id, seed[0]!.id))
        .innerJoin(postTable, eq(userTable.id, postTable.authorId))
        .groupBy(userTable.id),
    );

    expect(user.posts[0]).toBeInstanceOf(Date);
  });

  test("should map timestamp as Date with sqlDecoded", async () => {
    const user = await findFirst(
      db
        .select({
          userId: userTable.id,
          posts: jsonAgg(currentTimestamp()),
        })
        .from(userTable)
        .where(eq(userTable.id, seed[0]!.id))
        .innerJoin(postTable, eq(userTable.id, postTable.authorId))
        .groupBy(userTable.id),
    );

    expect(user.posts[0]).toBeInstanceOf(Date);
  });

  test("should map timestamp as string in sql", async () => {
    const user = await findFirst(
      db
        .select({ userId: userTable.id, posts: jsonAgg(sql<string>`NOW()`) })
        .from(userTable)
        .where(eq(userTable.id, seed[0]!.id))
        .innerJoin(postTable, eq(userTable.id, postTable.authorId))
        .groupBy(userTable.id),
    );

    expect(user.posts[0]).toBeTypeOf("string");
    expect(user.posts[0]).not.toBeInstanceOf(Date);
  });

  test("should filter jsonAgg", async () => {
    const users = await db
      .select({
        userId: userTable.id,
        posts: jsonAgg(postTable.createdAt, { filter: eq(userTable.id, 1) }),
      })
      .from(userTable)
      .innerJoin(postTable, eq(userTable.id, postTable.authorId))
      .groupBy(userTable.id);

    expect(users[0]?.posts.length).toBeGreaterThanOrEqual(1);
    expect(users[1]?.posts.length).toBe(0);
  });

  test("should order jsonAgg asc", async () => {
    const seedUser = seed.find((user) => user.posts.length > 1)!;

    const userDb = await findFirst(
      db
        .select({
          id: userTable.id,
          posts: jsonAgg(jsonBuildObject(getTableColumns(postTable)), {
            order: asc(postTable.id),
          }),
        })
        .from(userTable)
        .innerJoin(postTable, eq(userTable.id, postTable.authorId))
        .groupBy(userTable.id)
        .having(eq(userTable.id, seedUser.id)),
    );

    expect(userDb.id).toBe(seedUser.id);
    expect(userDb.posts.toSorted((a, b) => a.id - b.id)).toEqual(userDb.posts);
    expect(userDb.posts.toSorted((a, b) => b.id - a.id)).not.toEqual(
      userDb.posts,
    );
  });
});
