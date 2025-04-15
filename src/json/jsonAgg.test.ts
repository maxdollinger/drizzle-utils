import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { postTable, userTable } from "../../test_setup/schema";
import { jsonAgg } from "./jsonAgg";
import { asc, eq, sql } from "drizzle-orm";
import { interval } from "../time/interval";
import { sqlDecoded } from "../sqlDecoded";
import { dateDecoder } from "../time/decoder";
import { desc } from "drizzle-orm";

describe("jsonAgg", async () => {
    const { db, seed, exec } = await getDB();

    test("should aggreate values into an array", async () => {
        const users = await db
            .select({ id: userTable.id, postingTimes: jsonAgg(postTable.createdAt) })
            .from(userTable)
            .leftJoin(postTable, eq(userTable.id, postTable.authorId))
            .groupBy(userTable.id);

        const expectedUsers = seed.map((user) => ({
            id: user.id,
            postingTimes: user.posts.map((post) => post.createdAt),
        }));

        expect(users).toEqual(expectedUsers);
    });

    test("should aggreate values into an array with decoder", async () => {
        const days = sql<string>`generate_series('2025-04-01'::date, '2025-04-30'::date, ${interval({ day: 1 })}) as "day"`;
        const weekday = sql<number>`extract(dow from "day")::int`;

        const weekdays = await db
            .select({ weekday, dates: jsonAgg(sqlDecoded(sql<Date>`"day"`, dateDecoder)) })
            .from(days)
            .groupBy(weekday)
            .orderBy(weekday);

        expect(weekdays).toEqual([
            expect.objectContaining({
                weekday: 0,
                dates: expect.arrayContaining([new Date("2025-04-06")]),
            }),
            expect.objectContaining({
                weekday: 1,
                dates: expect.arrayContaining([new Date("2025-04-07")]),
            }),
            expect.objectContaining({
                weekday: 2,
                dates: expect.arrayContaining([new Date("2025-04-08")]),
            }),
            expect.objectContaining({
                weekday: 3,
                dates: expect.arrayContaining([new Date("2025-04-09")]),
            }),
            expect.objectContaining({
                weekday: 4,
                dates: expect.arrayContaining([new Date("2025-04-10")]),
            }),
            expect.objectContaining({
                weekday: 5,
                dates: expect.arrayContaining([new Date("2025-04-11")]),
            }),
            expect.objectContaining({
                weekday: 6,
                dates: expect.arrayContaining([new Date("2025-04-12")]),
            }),
        ]);
    });

    test("should aggreate values into an array without decoder and oder + filter them", async () => {
        const days = sql<string>`generate_series(1, 12, 1) as "num"`;
        const isEven = sql<boolean>`"num" % 2 = 0`;

        const [n1] = await db
            .select({ numbers: jsonAgg(sql<number>`"num"`, { filter: isEven, order: desc(sql`"num"`) }) })
            .from(days);

        expect(n1?.numbers).toEqual([12, 10, 8, 6, 4, 2]);

        const [n2] = await db
            .select({ numbers: jsonAgg(sql<number>`"num"`, { filter: isEven, order: asc(sql`"num"`) }) })
            .from(days);

        expect(n2?.numbers).toEqual([2, 4, 6, 8, 10, 12]);
    });
});
