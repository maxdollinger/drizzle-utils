import { sql } from "drizzle-orm";
import { sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export type Range = { start: Date; end: Date };

export class RangeEncoderError extends Error {
  public constructor() {
    super("tstzrange encoder recieved invalid date");
  }
}

export const tstzrangeDecoder = (value: string): Range => {
  const [startStr, endStr] = value.slice(1, -1).split(",");

  return {
    start: dateDecoder(startStr ?? ""),
    end: dateDecoder(endStr ?? ""),
  };
};

export const tstzrange = (range: Range): SQLDecoded<Range, string> => {
  if (isNaN(range.start.valueOf()) || isNaN(range.end.valueOf())) {
    throw new RangeEncoderError();
  }

  return sqlDecoded(
    sql<Range>`tstzrange(${range.start.toISOString()},${range.end.toISOString()},'[)')`.inlineParams(),
    tstzrangeDecoder,
  );
};
