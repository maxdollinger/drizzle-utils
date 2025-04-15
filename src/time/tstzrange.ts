import { sql } from "drizzle-orm";
import { sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export type Range = { start: Date; end: Date };

export const tstzrangeDecoder = (value: string): Range => {
    const [startStr, endStr] = value.slice(1, -1).split(",");

    return {
        start: dateDecoder(startStr ?? ""),
        end: dateDecoder(endStr ?? ""),
    };
};

export const tstzrange = (range: Range): SQLDecoded<Range, string> =>
    sqlDecoded(
        sql<Range>`tstzrange(${range.start.toISOString()},${range.end.toISOString()},'[)')`.inlineParams(),
        tstzrangeDecoder,
    );
