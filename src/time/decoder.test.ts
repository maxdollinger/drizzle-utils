import { describe, expect, test } from "vitest";
import { dateDecoder, DateDecoderError } from "./decoder";

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
