import { sql } from "drizzle-orm";
import { sqlDecoded } from "../sqlDecoded";

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;
export const MS_PER_MONTH = MS_PER_DAY * 30;
export const MS_PER_YEAR = MS_PER_HOUR * 8766;

const unitToMS: Record<string, number> = {
    year: MS_PER_YEAR,
    mon: MS_PER_MONTH,
    week: MS_PER_WEEK,
    day: MS_PER_DAY,
};

const pgIntervalDecoder = (interval: string): number => {
    let ms = 0;
    const parts = interval.split(" ");
    for (let i = 0; i < parts.length; i += 2) {
        if (parts[i]!.includes(":")) {
            const [hour, min, sec] = parts[i]?.split(":")!;
            ms += Number(hour) * MS_PER_HOUR + Number(min) * MS_PER_MINUTE + Number(sec) * MS_PER_SECOND;
        } else {
            const number = Number(parts[i] ?? 0);
            const unit = parts[i + 1] ?? 0;

            ms += (unitToMS[unit] ?? 0) * number;
        }
    }

    return ms;
};

export const interval = (iv: {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
}) =>
    sqlDecoded<number, string>(
        sql<number>`make_interval(${iv.year ?? 0},${iv.month ?? 0},${iv.week ?? 0},${iv.day ?? 0},${iv.hour ?? 0},${iv.minute ?? 0},${iv.second ?? 0})`.inlineParams(),
        pgIntervalDecoder,
    );
