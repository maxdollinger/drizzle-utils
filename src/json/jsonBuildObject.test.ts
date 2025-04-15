import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { userTable } from "../../test_setup/schema";
import { jsonBuildObject } from "./jsonBuildObject";
import { eq, sql } from "drizzle-orm";
import { tstzrange } from "../time/tstzrange";

describe("jsonBuildObject", async () => {
    const { db, seed, exec } = await getDB();

    test("should create json from table def", async () => {
        const firstUser = seed.find((user) => user.id === 1);
        if (!firstUser) {
            throw new Error("no seed user");
        }

        const [user] = await db
            .select({
                id: userTable.id,
                info: jsonBuildObject({
                    name: userTable.name,
                    joinedAt: userTable.createdAt,
                }),
            })
            .from(userTable)
            .where(eq(userTable.id, firstUser.id));

        if (!user) {
            throw new Error("no user found");
        }

        expect(user?.info).toStrictEqual({
            name: firstUser.name,
            joinedAt: firstUser.createdAt,
        } satisfies (typeof user)["info"]);
    });

    test("should create json from sql statements", async () => {
        const defaultRange1 = {
            start: new Date("2025-04-01T09:00:00+02:00"),
            end: new Date("2025-04-01T19:00:00+02:00"),
        };
        const [row] = await exec({
            json: jsonBuildObject({
                range: tstzrange(defaultRange1),
                string: sql<string>`'hello from jsonObject'::text`,
            }),
        });

        expect(row?.json).toEqual({
            range: defaultRange1,
            string: "hello from jsonObject",
        });
    });
});
