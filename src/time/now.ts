import { sql } from "drizzle-orm";
import { sqlDecoded } from "../sqlDecoded";
import { dateDecoder } from "./decoder";

export function now() {
    return sqlDecoded<Date, string>(sql`NOW()`, dateDecoder);
}
