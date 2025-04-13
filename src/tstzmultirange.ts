import { DriverValueMapper, sql } from "drizzle-orm";
import { TstzRange, TSTZRANGE_LENGTH, tstzRangeMapper } from "./tstzrange";

type TstzMultirange = TstzRange[];

export const tstzmultirangeMapper: DriverValueMapper<TstzMultirange, string> = {
  mapFromDriverValue: (value) => {
    if (value.length === 2) {
      return [];
    }

    let idx = 1;
    const ranges: TstzRange[] = [];
    while (idx < value.length - 1) {
      const rangeStr = value.slice(idx, idx + TSTZRANGE_LENGTH);
      const range = tstzRangeMapper.mapFromDriverValue(rangeStr);
      ranges.push(range);
      idx += TSTZRANGE_LENGTH + 1;
    }

    return ranges;
  },

  mapToDriverValue: (multirange) => {
    const rangesSql = sql.join(
      multirange.map(tstzRangeMapper.mapToDriverValue),
      sql.raw(","),
    );

    return sql`tstzmultirange(${rangesSql})`;
  },
};
