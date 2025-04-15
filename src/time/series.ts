import { sql } from "drizzle-orm";
import { interval, Interval } from "./interval";
import { Range } from "./tstzrange";
import { sqlDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export const generateTimeSeries = (range: Range, intervalOpts: Interval) =>
    sqlDecoded<Date, string>(
        sql<Date>`generate_series(${range.start.toISOString()},${range.end.toISOString()},${interval(intervalOpts)})`.inlineParams(),
        dateDecoder,
    );
