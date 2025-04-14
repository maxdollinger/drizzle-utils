import { AnyColumn, SQL, sql } from "drizzle-orm";
import { DrizzleDB } from "./db";
import { hasDecoder, SQLDecoded } from "../src/sqlDecoded";
import { Primitive } from "../src/type.utils";
import { SelectResultFields } from "drizzle-orm/query-builders/select.types";

type Selection = Record<string, AnyColumn | SQLDecoded<unknown, unknown> | SQL<Primitive>>;

export const getSqlString = <T extends Selection>(db: DrizzleDB, selection: T): string => {
    const sqlChunks = Object.entries(selection).map(([key, statement]) => sql`${statement} as "${sql.raw(key)}"`);
    const rawSql = sql`select ${sql.join(sqlChunks, sql.raw(","))};`;

    return db.execute(rawSql.inlineParams()).getQuery().sql;
};

export const buildExecute =
    (db: DrizzleDB) =>
    async <T extends Selection>(selection: T, log: boolean = false): Promise<SelectResultFields<T>[]> => {
        const sqlChunks = Object.entries(selection).map(([key, statement]) => sql`${statement} as "${sql.raw(key)}"`);
        const rawSql = sql`select ${sql.join(sqlChunks, sql.raw(","))};`.inlineParams();

        const query = db.execute(rawSql);
        if (log) {
            console.debug("[Drizzle-Query]", query.getQuery().sql);
        }

        const raw = await query;
        if (log) {
            console.debug("[Resulsts]", raw.rows);
        }

        return raw.rows.map((row) =>
            Object.fromEntries(
                Object.entries(row).map(([key, value]) => {
                    const field = selection[key];
                    if (hasDecoder(field)) {
                        return [key, field.mapFromDriverValue(value)];
                    } else {
                        return [key, value];
                    }
                }),
            ),
        ) as SelectResultFields<T>[];
    };

export const extractValue = async <T extends Record<string, unknown>, K extends keyof T>(
    rows: Promise<T[]>,
    key: K,
): Promise<T[K]> => {
    const firstRow = (await rows).at(0);
    if (!firstRow) {
        throw new Error("empty results");
    }

    return firstRow[key];
};
