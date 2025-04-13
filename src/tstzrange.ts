import { DriverValueMapper, sql } from "drizzle-orm";
import { sqlDecoded, SQLDecoded } from "./sqlDecoded";
import { tstz } from "./timeHelper";

class RangeParsingError extends Error {
  public constructor(msg: string, driverValue: string) {
    super(msg, { cause: { driverValue } });
  }
}

export type TstzRange = {
  start: Date;
  end: Date;
};

export const TSTZRANGE_LENGTH = 51;

export const tstzRangeMapper: DriverValueMapper<TstzRange, string> = {
  mapFromDriverValue: (value) => {
    if (value.length < TSTZRANGE_LENGTH) {
      return {
        start: new Date(0),
        end: new Date(0),
      };
    }

    const start = new Date(value.slice(1, 25));
    const end = new Date(value.slice(26, -1));

    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      throw new RangeParsingError(`failed range parsing from driver`, value);
    }

    return {
      start,
      end,
    };
  },

  mapToDriverValue: ({ start, end }) => {
    if (start.valueOf() === 0 && end.valueOf() === 0) {
      return "[)";
    }

    return sql`tstzrange(${tstz(start)}, ${tstz(end)}, '[)')`;
  },
};

export const tstzRange = (range: TstzRange): SQLDecoded<TstzRange, string> =>
  sqlDecoded(
    sql`tstzRangeMapper.mapToDriverValue(range)`,
    tstzRangeMapper.mapFromDriverValue,
  );
