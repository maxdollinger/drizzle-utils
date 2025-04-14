import { describe, expect, test } from "vitest";
import { dateDecoder, DateDecoderError, timestampDecoder } from "./decoder";

describe("dateDecoder", () => {
  test("should convert string to date", () => {
    const date = dateDecoder("2025-01-01");

    expect(date).toBeInstanceOf(Date);
    expect(date.valueOf()).toBeTypeOf("number");
  });

  test("should throw DateDecoderError on failed decoding", () => {
    expect(() => dateDecoder("not-a-date")).toThrow(DateDecoderError);
  });
});

describe("timestampDecoder", () => {
  test("should convert string to number", () => {
    const date = new Date("2025-01-01T09:00:00+02:00");
    const ts = timestampDecoder("2025-01-01T09:00:00+02:00");

    expect(ts).toBeTypeOf("number");
    expect(ts).toBe(date.valueOf());
  });
});
