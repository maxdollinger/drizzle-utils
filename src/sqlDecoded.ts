import { DriverValueDecoder, SQL } from "drizzle-orm";
import { Primitive } from "./type.utils";
import { noopDecoder } from "drizzle-orm";

export type SQLDecoded<TData = unknown, TDriver = unknown> = SQL<TData> &
  DriverValueDecoder<TData, TDriver>;

export type DriverValue<T extends SQLDecoded<unknown, unknown>> =
  T extends SQLDecoded<unknown, infer TDriver> ? TDriver : never;

export type DataValue<T extends SQLDecoded<unknown, unknown>> =
  T extends SQLDecoded<infer TData, unknown> ? TData : never;

export type Decoder<TData, TDriver> = (value: TDriver) => TData;

export function sqlDecoded<TData extends Primitive>(
  sql: SQL<TData>,
): SQLDecoded<TData, TData>;
export function sqlDecoded<TData, TDriver>(
  sql: SQL<TData>,
  decoder: (value: TDriver) => TData,
): SQLDecoded<TData, TDriver>;
export function sqlDecoded<TData, TDriver = unknown>(
  sql: SQL<TData>,
  decoder?: (value: TDriver) => TData,
): SQLDecoded<TData, TDriver> {
  decoder ??= noopDecoder.mapFromDriverValue;
  return Object.assign(sql.mapWith(decoder), {
    mapFromDriverValue: decoder,
  } satisfies DriverValueDecoder<TData, TDriver>);
}

export const hasDecoder = <T>(
  value: T,
): value is T & DriverValueDecoder<unknown, unknown> => {
  return (
    value !== null &&
    typeof value === "object" &&
    "mapFromDriverValue" in value &&
    typeof value.mapFromDriverValue === "function"
  );
};
