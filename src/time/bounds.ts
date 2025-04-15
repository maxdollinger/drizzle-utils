import { sql, SQL } from "drizzle-orm";
import { Range } from "./tstzrange";
import { AnyColumn } from "drizzle-orm";
import { sqlDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export const tstzrangeLower = <T extends Range | number>(
    sqlst: SQL<T | T[]> | AnyColumn<{ data: Range | Range[] }> | string,
) => sqlDecoded<Date, string>(sql`lower(${sqlst})`, dateDecoder);

export const tstzrangeUpper = <T extends Range | number>(
    sqlst: SQL<T | T[]> | AnyColumn<{ data: Range | Range[] }> | string,
) => sqlDecoded<Date, string>(sql`upper(${sqlst})`, dateDecoder);
