import { describe, test, expect } from "vitest";
import { getDB } from "../test_setup/db";
import { userTable } from "../test_setup/schema";
import { eq } from "drizzle-orm";
import { findFirst } from "./findHelper";
import { DatabaseError } from "./databaseError";

describe("findHelper", async () => {
  const { db, seed } = await getDB();

  test("should return first entry", async () => {
    const seedUser = seed[0]!;
    const dbUser = await findFirst(
      db
        .select({ userId: userTable.id })
        .from(userTable)
        .where(eq(userTable.id, seedUser.id)),
    );

    expect(dbUser.userId).toBe(seedUser.id);
  });

  test("should throw DatabaseError on empty results", async () => {
    await expect(
      findFirst(
        db
          .select({ userId: userTable.id })
          .from(userTable)
          .where(eq(userTable.id, seed.length + 1000)),
      ),
    ).rejects.toThrow(DatabaseError);
  });
});
