import { AnyColumn, SQL } from "drizzle-orm";
import { SQLDecoded } from "./sqlDecoded";

export type Primitive = string | number | boolean | null;

export type Selection = Record<string, AnyColumn | SQLDecoded<unknown, unknown> | SQL<Primitive>>;

export type AtLeastOne<T> = {
    [K in keyof T]: { [P in K]-?: NonNullable<T[P]> } & { [P in Exclude<keyof T, K>]?: T[P] };
}[keyof T];
