import { describe, expect, test } from "vitest";
import { getDB } from "../../test_setup/db";
import { tstzrangeLower, tstzrangeUpper } from "./bounds";
import { tstzrange } from "./tstzrange";
import { extractValue } from "../../test_setup/execute";
import { tstzmultirange } from "./tstzmultirange";

const defaultRange1 = {
    start: new Date("2025-04-01T09:00:00+02:00"),
    end: new Date("2025-04-01T19:00:00+02:00"),
};

const defaultRange2 = {
    start: new Date("2025-04-02T09:00:00+02:00"),
    end: new Date("2025-04-02T19:00:00+02:00"),
};

describe("tstzlower", async () => {
    const { exec } = await getDB();

    test("shoud return the lower bound of tstzrange", async () => {
        const value = await extractValue(exec({ lower: tstzrangeLower(tstzrange(defaultRange1)) }), "lower");

        expect(value).toEqual(defaultRange1.start);
    });

    test("shoud return the lower bound of tstzrangemultirange", async () => {
        const value = await extractValue(
            exec({ lower: tstzrangeLower(tstzmultirange([defaultRange2, defaultRange1])) }),
            "lower",
        );

        expect(value).toEqual(defaultRange1.start);
    });
});

describe("tstzupper", async () => {
    const { exec } = await getDB();

    test("shoud return the upper bound of tstzrange", async () => {
        const value = await extractValue(exec({ lower: tstzrangeUpper(tstzrange(defaultRange1)) }), "lower");

        expect(value).toEqual(defaultRange1.end);
    });

    test("shoud return the upper bound of tstzrangemultirange", async () => {
        const value = await extractValue(
            exec({ lower: tstzrangeUpper(tstzmultirange([defaultRange2, defaultRange1])) }),
            "lower",
        );

        expect(value).toEqual(defaultRange2.end);
    });
});
