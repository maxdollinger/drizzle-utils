import { type AnyColumn, SQL, sql } from "drizzle-orm";
import { Primitive } from "../type.utils";
import { hasDecoder, sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { noopDecoder } from "drizzle-orm";

export function jsonAgg<TData extends Primitive>(
    sql: SQL<TData>,
    opts?: {
        filter?: SQL;
        order?: SQL;
    },
): SQLDecoded<TData[], TData[]>;
export function jsonAgg<TData, TDriver>(
    sql: AnyColumn | SQLDecoded<TData, TDriver>,
    opts?: {
        filter?: SQL;
        order?: SQL;
    },
): SQLDecoded<TData[], TData[]>;
export function jsonAgg<TData, TDriver = unknown>(
    sqlWithDecoder: AnyColumn | SQLDecoded<TData, TDriver> | SQL<TData>,
    opts?: {
        filter?: SQL;
        order?: SQL;
    },
): SQLDecoded<TData[], TDriver[]> {
    const filter = sql` filter (where ${opts?.filter})`.if(opts?.filter);
    const order = sql` order by ${opts?.order}`.if(opts?.order);
    const statement = sql<TData[]>`coalesce(json_agg(${sqlWithDecoder}${order})${filter},'[]'::json)`;
    const mapper = (values: TDriver[]) =>
        values.map(hasDecoder(sqlWithDecoder) ? sqlWithDecoder.mapFromDriverValue : noopDecoder.mapFromDriverValue);

    return sqlDecoded(statement, mapper);
}
