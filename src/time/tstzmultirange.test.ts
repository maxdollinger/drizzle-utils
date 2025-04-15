import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { tstzmultirange } from "./tstzmultirange";
import { extractValue } from "../../test_setup/execute";

const defaultRange1 = {
    start: new Date("2025-04-01T09:00:00+02:00"),
    end: new Date("2025-04-01T19:00:00+02:00"),
};

const defaultRange2 = {
    start: new Date("2025-04-02T09:00:00+02:00"),
    end: new Date("2025-04-02T19:00:00+02:00"),
};

const defaultRange3 = {
    start: new Date("2025-04-03T09:00:00+02:00"),
    end: new Date("2025-04-03T19:00:00+02:00"),
};

describe("tstzmultirange", async () => {
    const { exec, rawSql } = await getDB();

    test("should generate correct sql", () => {
        const sqlStr = rawSql({ range: tstzmultirange([defaultRange1]) });

        expect(sqlStr).toContain(
            `tstzmultirange(tstzrange('${defaultRange1.start.toISOString()}','${defaultRange1.end.toISOString()}','[)'))`,
        );
    });

    test("should correct decoded range", async () => {
        const ranges = await extractValue(
            exec({
                range: tstzmultirange([defaultRange1, defaultRange2, defaultRange3]),
            }),
            "range",
        );

        expect(ranges).toStrictEqual([defaultRange1, defaultRange2, defaultRange3]);
    });
});
