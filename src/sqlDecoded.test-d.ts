import { assertType, expectTypeOf, describe, test } from "vitest";
import { SQLDecoded, sqlDecoded } from "./sqlDecoded";
import { DriverValueDecoder, sql } from "drizzle-orm";

describe("sqlDecoded", () => {
  test("satisfies DriverValueDecoder", () => {
    assertType<DriverValueDecoder<string, string>>(sqlDecoded(sql<string>``));
  });

  test("function overloading for sql statements with primitives", () => {
    expectTypeOf(sqlDecoded(sql<string>``)).toEqualTypeOf<
      SQLDecoded<string, string>
    >();

    expectTypeOf(sqlDecoded(sql<Date>``, (v: string) => new Date(v)))
      .toEqualTypeOf<SQLDecoded<Date, string>>;

    // @ts-expect-error is not assignable to parameter
    assertType(sqlDecoded(sql<Record<string, string>>``));
  });
});
