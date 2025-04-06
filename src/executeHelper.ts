import { sql, SQL } from "drizzle-orm";
import { PgDatabase } from "drizzle-orm/pg-core";
import { type SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { hasDecoder, SQLDecoded } from "./sqlDecoded";
import { Primitive } from "./type.utils";

export const select = async <
  S extends Record<string, SQLDecoded<unknown, unknown> | SQL<Primitive>>,
>(
  db: PgDatabase<any, any, any>,
  selection: S,
): Promise<SelectResultFields<S>[]> => {
  const columns = sql.join(
    Object.entries(selection).map(
      ([key, statement]) => sql`${statement} as "${sql.raw(key)}"`,
    ),
    sql.raw(","),
  );

  const query = sql`select ${columns};`;

  const { rows } = await db.execute(query);

  return rows.map(
    (value: {
      [K in keyof S]: S[K] extends SQLDecoded<infer TDriver, unknown>
        ? TDriver
        : S[K] extends SQL<infer TDriver>
          ? TDriver
          : never;
    }) => {
      for (const key of Object.keys(value)) {
        if (hasDecoder(selection[key])) {
          //@ts-ignore
          value[key] = selection[key].mapFromDriverValue(value[key]);
        }
      }

      return value;
    },
  );
};
