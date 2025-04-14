import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { extractValue } from "../../test_setup/execute";
import { tstzrange } from "./tstzrange";

const defaultRange = {
  start: new Date("2025-04-01T09:00:00+02:00"),
  end: new Date("2025-04-01T19:00:00+02:00"),
};

describe("tstzrange", async () => {
  const { exec, rawSql } = await getDB();

  test("should return correct sql", async () => {
    const sql = rawSql({ range: tstzrange(defaultRange) });

    expect(sql).toContain(
      `tstzrange('${defaultRange.start.toISOString()}','${defaultRange.end.toISOString()}','[)')`,
    );
  });

  test("should return the correct decoded range", async () => {
    const range = await extractValue(
      exec({ range: tstzrange(defaultRange) }),
      "range",
    );

    expect(range).toStrictEqual(defaultRange);
  });
});
