import { describe, expect, test } from "vitest";
import { getDB } from "../test_setup/db";
import { select } from "../test_setup/executeHelper";
import { sqlDecoded } from "./sqlDecoded";
import { TstzRange, tstzRangeMapper } from "./tstzrange";
import { sql } from "drizzle-orm";
import { findFirst } from "./findHelper";
import { tstz } from "./timeHelper";

describe("timeRange", async () => {
  const { db } = await getDB();

  const start = new Date("2025-04-01T09:00:00.000Z");
  const end = new Date("2025-04-01T19:00:00.000Z");

  test("transform from driver", async () => {
    const { range } = await findFirst(
      select(db, {
        range: sqlDecoded(
          sql`tstzrange(${tstz(start)},${tstz(end)}, '[)')`,
          tstzRangeMapper.mapFromDriverValue,
        ),
      }),
    );

    expect(range).toEqual({
      start,
      end,
    } satisfies TstzRange);
  });

  test("transform to driver", async () => {
    const tstzrange: TstzRange = {
      start,
      end,
    };

    const { rows } = await db.execute<{ range: string }>(
      sql`select ${tstzRangeMapper.mapToDriverValue(tstzrange)} as "range"`,
    );

    expect(rows[0]?.range).toBe(
      '["2025-04-01 09:00:00+00","2025-04-01 19:00:00+00")',
    );
  });

  test("default to range with epoch timestamp 0 on infinit ranges", async () => {
    const { rows } = await db.execute<{ multirange: string }>(
      sql`select tstzmultirange('["2025-04-01 09:00:00+00",)'::tstzrange) as "multirange";`,
    );

    const raw = rows[0]!["multirange"];
    expect(raw).toBeTypeOf("string");

    const multirange = tstzRangeMapper.mapFromDriverValue(raw);

    expect(multirange).toEqual({ start: new Date(0), end: new Date(0) });
  });
});
