import { type AnyColumn, type DriverValueDecoder, SQL, sql } from "drizzle-orm";
import { type SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { Primitive } from "../type.utils";
import { sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { noopDecoder } from "drizzle-orm";

type Selection = Record<
  string,
  AnyColumn | SQLDecoded<unknown, unknown> | SQL<Primitive>
>;

const hasDecoder = <T>(
  value: T,
): value is T & DriverValueDecoder<unknown, unknown> => {
  return (
    value !== null &&
    typeof value === "object" &&
    "mapFromDriverValue" in value &&
    typeof value.mapFromDriverValue === "function"
  );
};

const mapJsonObject =
  <S extends Selection>(selection: S) =>
  (value: Record<string, unknown>): SelectResultFields<S> => {
    for (const key of Object.keys(value)) {
      if (value[key] !== null && hasDecoder(selection[key])) {
        value[key] = selection[key].mapFromDriverValue(value[key]);
      }
    }

    return value as SelectResultFields<S>;
  };

export const jsonBuildObject = <S extends Selection>(
  selection: S,
): SQLDecoded<SelectResultFields<S>, Record<string, unknown>> => {
  const chunks = Object.entries(selection).map(([key, value]) =>
    sql.raw(`'${key}',`).append(sql`${value}`),
  );

  const obj = sql<
    SelectResultFields<S>
  >`json_build_object(${sql.join(chunks, sql`,`)})`;
  return sqlDecoded(obj, mapJsonObject(selection));
};

export function jsonAgg<TData extends Primitive>(
  sql: SQL<TData>,
  opts?: {
    filter?: SQL;
    order?: SQL;
  },
): SQLDecoded<TData[], TData[]>;
export function jsonAgg<TData, TDriver>(
  sql: AnyColumn | SQLDecoded<TData, TDriver>,
  opts?: {
    filter?: SQL;
    order?: SQL;
  },
): SQLDecoded<TData[], TData[]>;
export function jsonAgg<TData, TDriver = unknown>(
  sqlWithDecoder: AnyColumn | SQLDecoded<TData, TDriver> | SQL<TData>,
  opts?: {
    filter?: SQL;
    order?: SQL;
  },
): SQLDecoded<TData[], TDriver[]> {
  const filter = sql`filter ( where ${opts?.filter} )`.if(opts?.filter);
  const order = sql`order by ${opts?.order}`.if(opts?.order);
  const statement = sql<
    TData[]
  >`coalesce(json_agg(${sqlWithDecoder} ${order}) ${filter}, '[]'::json)`;
  const mapper = (values: TDriver[]) =>
    values.map(
      hasDecoder(sqlWithDecoder)
        ? sqlWithDecoder.mapFromDriverValue
        : noopDecoder.mapFromDriverValue,
    );

  return sqlDecoded(statement, mapper);
}
