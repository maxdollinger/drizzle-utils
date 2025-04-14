import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { extractValue } from "../../test_setup/execute";
import { now } from "./now";
import { timestampDecoder } from "./decoder";

describe("pg now", async () => {
  const { exec } = await getDB();

  test("should return current Date", async () => {
    const dateNow = new Date();
    const value = await extractValue(exec({ now: now() }), "now");

    expect(value).toBeInstanceOf(Date);
    expect(value.valueOf()).toBeGreaterThanOrEqual(dateNow.valueOf());
  });

  test("should return current Date as timestamp", async () => {
    const value = await extractValue(
      exec({ now: now(timestampDecoder) }),
      "now",
    );

    expect(value).toBeTypeOf("number");
  });
});
