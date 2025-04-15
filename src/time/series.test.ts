import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { generateTimeSeries } from "./series";

const defaultRange1 = {
    start: new Date("2025-04-01"),
    end: new Date("2025-04-04"),
};

describe("series", async () => {
    const { exec } = await getDB();

    test("should create date series", async () => {
        const results = await exec({ date: generateTimeSeries(defaultRange1, { day: 1 }) });

        expect(results).toEqual([
            { date: defaultRange1.start },
            { date: new Date("2025-04-02") },
            { date: new Date("2025-04-03") },
            { date: defaultRange1.end },
        ]);
    });
});
