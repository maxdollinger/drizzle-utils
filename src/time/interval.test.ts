import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { extractValue } from "../../test_setup/execute";
import {
  interval,
  MS_PER_MINUTE,
  MS_PER_MONTH,
  MS_PER_SECOND,
} from "./interval";

describe("pg interval", async () => {
  const { exec, rawSql } = await getDB();

  test("should create correct sql", () => {
    const sql = rawSql({ interval: interval({ year: 1 }) });

    expect(sql).toContain("make_interval(1,0,0,0,0,0,0)");
  });

  test("should return correct ms", async () => {
    const value = await extractValue(
      exec({ interval: interval({ month: 1, minute: 1, second: 1 }) }),
      "interval",
    );

    expect(value).toBe(MS_PER_MONTH + MS_PER_MINUTE + MS_PER_SECOND);
  });
});
