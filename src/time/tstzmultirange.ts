import { sql } from "drizzle-orm";
import { sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { tstzrange, tstzrangeDecoder, type Range } from "./tstzrange";

const RANGE_LENGTH_WITH_SEPARATOR = 51;
const multriangeDecoder = (value: string): Range[] => {
  const ranges: Range[] = [];
  for (let i = 1; i < value.length - 1; i += RANGE_LENGTH_WITH_SEPARATOR + 1) {
    const rangeStr = value.slice(i, i + RANGE_LENGTH_WITH_SEPARATOR);
    ranges.push(tstzrangeDecoder(rangeStr));
  }

  return ranges;
};

export const tstzmultirange = (
  ranges: Range[],
): SQLDecoded<Range[], string> => {
  const rangesSql = sql.join(
    ranges.map((range) => tstzrange(range)),
    sql`,`,
  );

  return sqlDecoded(sql`tstzmultirange(${rangesSql})`, multriangeDecoder);
};
