import { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { hasDecoder, sqlDecoded, SQLDecoded } from "../sqlDecoded";
import { Selection } from "../type.utils";
import { sql } from "drizzle-orm";

const mapJsonObject =
    <S extends Selection>(selection: S) =>
    (value: Record<string, unknown>): SelectResultFields<S> => {
        for (const key of Object.keys(value)) {
            if (value[key] !== null && hasDecoder(selection[key])) {
                value[key] = selection[key].mapFromDriverValue(value[key]);
            }
        }

        return value as SelectResultFields<S>;
    };

export const jsonBuildObject = <S extends Selection>(
    selection: S,
): SQLDecoded<SelectResultFields<S>, Record<string, unknown>> => {
    const chunks = Object.entries(selection).map(([key, value]) => sql.raw(`'${key}',`).append(sql`${value}`));

    const obj = sql<SelectResultFields<S>>`json_build_object(${sql.join(chunks, sql`,`)})`;
    return sqlDecoded(obj, mapJsonObject(selection));
};
