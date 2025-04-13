import { describe, expect, test } from "vitest";
import { getDB } from "../test_setup/db";
import { tstzRange, TstzRange } from "./tstzrange";
import { sql } from "drizzle-orm";
import { tstzmultirangeMapper } from "./tstzmultirange";

describe("timeRange", async () => {
  const { db } = await getDB();

  const range1: TstzRange = {
    start: new Date("2025-04-01T09:00:00.000Z"),
    end: new Date("2025-04-01T19:00:00.000Z"),
  };

  const range2: TstzRange = {
    start: new Date("2025-04-02T09:00:00.000Z"),
    end: new Date("2025-04-02T19:00:00.000Z"),
  };

  test("transform from driver", async () => {
    const { rows } = await db.execute<{ multirange: string }>(
      sql`select tstzmultirange(${tstzRange(range1)},${tstzRange(range2)}) as "multirange";`,
    );

    const raw = rows[0]!["multirange"];
    expect(raw).toBeTypeOf("string");

    const multirange = tstzmultirangeMapper.mapFromDriverValue(raw);

    expect(multirange).toEqual([range1, range2]);
  });

  test("transform to driver", async () => {
    const { rows } = await db.execute<{ multirange: string }>(
      sql`select ${tstzmultirangeMapper.mapToDriverValue([range2, range1])} as "multirange";`,
    );

    const raw = rows[0]!["multirange"];
    expect(raw).toBeTypeOf("string");
    expect(raw).toMatch(
      `{["2025-04-01 09:00:00+00","2025-04-01 19:00:00+00"),["2025-04-02 09:00:00+00","2025-04-02 19:00:00+00")}`,
    );
  });

  test("empty range", async () => {
    const { rows } = await db.execute<{ multirange: string }>(
      sql`select tstzmultirange() as "multirange";`,
    );

    const raw = rows[0]!["multirange"];
    expect(raw).toBeTypeOf("string");

    const multirange = tstzmultirangeMapper.mapFromDriverValue(raw);

    expect(multirange).toEqual([]);
  });
});
