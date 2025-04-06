import { describe, test, expect } from "vitest";
import { getDB } from "../test_setup/db";
import { findFirst } from "./findHelper";
import { currentTimestamp, toEpoch, typedNoopDecoder } from "./timeHelper";
import { select } from "./executeHelper";

describe("timeHelper", async () => {
  const { db } = await getDB();

  test("curretTimestamp to date", async () => {
    const { time } = await findFirst(select(db, { time: currentTimestamp() }));
    expect(time).toBeInstanceOf(Date);
  });

  test("curretTimestamp to string", async () => {
    const { time } = await findFirst(
      select(db, { time: currentTimestamp(typedNoopDecoder) }),
    );
    expect(time).not.toBeInstanceOf(Date);
    expect(time).toBeTypeOf("string");
  });

  test("toEpoch from date", async () => {
    const date = new Date("2025-04-01T09:30:00.000Z");
    const { time } = await findFirst(select(db, { time: toEpoch(date) }));
    expect(time).toBe(date.valueOf());
  });

  test("toEpoch from currentTimestamp", async () => {
    const { time } = await findFirst(
      select(db, { time: toEpoch(currentTimestamp()) }),
    );
    expect(new Date(time).valueOf()).toBe(time);
  });
});
