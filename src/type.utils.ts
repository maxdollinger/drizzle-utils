import { AnyColumn, SQL } from "drizzle-orm";
import { SQLDecoded } from "./sqlDecoded";

export type Primitive = string | number | boolean | null;

export type Selection = Record<string, AnyColumn | SQLDecoded<unknown, unknown> | SQL<Primitive>>;
