import { sql } from "drizzle-orm";
import { Decoder, sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export function now(): SQLDecoded<Date, string>;
export function now<T>(decoder: Decoder<T, string>): SQLDecoded<T, string>;
export function now<T>(decoder?: Decoder<T, string>) {
  return sqlDecoded(sql`NOW()`, decoder ?? dateDecoder);
}
