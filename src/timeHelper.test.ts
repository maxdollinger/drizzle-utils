import { describe, test, expect } from "vitest";
import { getDB } from "../test_setup/db";
import { findFirst } from "./findHelper";
import {
  currentTimestamp,
  dateTruncate,
  toEpoch,
  typedNoopDecoder,
} from "./timeHelper";
import { select } from "../test_setup/executeHelper";
import { SQLDecoded } from "./sqlDecoded";

describe("timeHelper", async () => {
  const { db } = await getDB();

  const execTimeHelper = async <TData, TDriver>(
    sql: SQLDecoded<TData, TDriver>,
  ): Promise<TData> => {
    const { time } = await findFirst(select(db, { time: sql }));
    return time;
  };

  test("curretTimestamp to date", async () => {
    const time = await execTimeHelper(currentTimestamp());
    expect(time).toBeInstanceOf(Date);
  });

  test("curretTimestamp to string", async () => {
    const time = await execTimeHelper(currentTimestamp(typedNoopDecoder));
    expect(time).not.toBeInstanceOf(Date);
    expect(time).toBeTypeOf("string");
  });

  test("toEpoch from date", async () => {
    const date = new Date("2025-04-01T09:30:00.000Z");
    const time = await execTimeHelper(toEpoch(date));
    expect(time).toBe(date.valueOf());
  });

  test("toEpoch from currentTimestamp", async () => {
    const time = await execTimeHelper(toEpoch(currentTimestamp()));
    expect(new Date(time).valueOf()).toBe(time);
  });

  test("date truncate", async () => {
    const time = await execTimeHelper(dateTruncate(currentTimestamp()));
    expect(time.toISOString()).toContain("T00:00:00.000Z");
  });
});
