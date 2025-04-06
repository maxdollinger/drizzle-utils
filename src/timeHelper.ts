import { AnyColumn, SQL, sql } from "drizzle-orm";
import { SQLDecoded, sqlDecoded } from "./sqlDecoded";
import { DriverValueDecoder } from "drizzle-orm";

type TimeSQL = string | SQL<Date> | AnyColumn<{ data: Date }>;

type ValueDecoder<TData, TDriver> = DriverValueDecoder<
  TData,
  TDriver
>["mapFromDriverValue"];

export const dateDecoder = (value: string | number) => new Date(value);
export const typedNoopDecoder = <T>(value: T) => value;

export function currentTimestamp(): SQLDecoded<Date, string>;
export function currentTimestamp<T>(
  decoder: ValueDecoder<T, string>,
): SQLDecoded<T, string>;
export function currentTimestamp<T>(decoder?: ValueDecoder<T, string>) {
  return sqlDecoded(sql`now()`, decoder ?? dateDecoder);
}

/*
 * If embedded in another sql the value is epoch seconds if mapped to TS it becomes milliseconds
 */
export function toEpoch(timeSql: TimeSQL | Date): SQLDecoded<number, number>;
export function toEpoch<T>(
  timeSql: TimeSQL | Date,
  mapper: ValueDecoder<T, number>,
): SQLDecoded<T, number>;
export function toEpoch<T>(
  timeSql: TimeSQL | Date,
  mapper?: ValueDecoder<T, number>,
) {
  return sqlDecoded(
    sql`extract(epoch from ${timeSql}::timestamp)::bigint`,
    (value: number) => {
      const milli = value * 1000;
      return mapper ? mapper(milli) : milli;
    },
  );
}
