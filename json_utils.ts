import { type AnyColumn, type DriverValueDecoder, SQL, sql } from "drizzle-orm";
import {
  type SelectResultField,
  type SelectResultFields,
} from "drizzle-orm/query-builders/select.types";

type Selection = Record<string, AnyColumn | SQL>;
type MapperFn<R extends AnyColumn | SQL> = DriverValueDecoder<SelectResultField<R>, unknown>['mapFromDriverValue'];

type Primitive = boolean | string | number | null;
type KeysForPrimitiveProps<S extends Selection> = { [K in keyof S]: SelectResultField<S[K]> extends Primitive ? K : never }[keyof S];
type KeysForNonPrimitiveProps<S extends Selection> = { [K in keyof S]: SelectResultField<S[K]> extends Primitive ? never : K }[keyof S];
type HasDecoder<T> = T extends AnyColumn ? true : T extends DriverValueDecoder<unknown, unknown> ? true : false;

type KeysWithoutDecoder<S extends Selection> = { [K in keyof S]: HasDecoder<S[K]> extends true ? never : K }[keyof S];
type WithoutDecoderProps<S extends Selection> = { [K in KeysWithoutDecoder<S>]: S[K] };
type SQLMapper<S extends Selection> = { [K in KeysForPrimitiveProps<WithoutDecoderProps<S>>]?: MapperFn<S[K]> } & {
  [K in KeysForNonPrimitiveProps<WithoutDecoderProps<S>>]: MapperFn<S[K]>;
};

type KeysWithDecoder<S extends Selection> = { [K in keyof S]: HasDecoder<S[K]> extends true ? K : never }[keyof S];
type DecoderProps<S extends Selection> = { [K in KeysWithDecoder<S>]?: MapperFn<S[K]> };

type Mapper<S extends Selection> = DecoderProps<S> & SQLMapper<S>;

type EnforceMapper<S extends Selection, M extends Mapper<S> | undefined> = undefined extends M
  ? undefined
  : { [K in keyof M]: undefined extends M[K] ? true : false }[keyof M] extends true | undefined
  ? [M] | []
  : [M];

class SQLDecoder<TData, TDriver = unknown>
  extends SQL<TData>
  implements DriverValueDecoder<TData, TDriver>
{
  public readonly mapFromDriverValue: (value: TDriver) => TData;

  public constructor(sqlinit: SQL<TData>, mapper: (value: TDriver) => TData) {
    super([sqlinit.mapWith(mapper)]);
    this.mapFromDriverValue = mapper;
  }
}

const hasDecoder = <T extends object>(value: T): value is T & DriverValueDecoder<unknown, unknown>  => {
    return 'mapFromDriverValue' in value && typeof value.mapFromDriverValue === 'function';
}

const mapJsonObject =
  <S extends Selection>(selection: S, mapper?: Mapper<S>) =>
  (value: Record<string, unknown>): SelectResultFields<S> => {
    for (const key of Object.keys(value)) {
      if (value[key] !== null) {
        const column = selection[key];
        const mapperKey = key as keyof Mapper<S>;
        if (mapper?.[mapperKey]) {
          value[key] = mapper[mapperKey](value[key]);
        } else if (hasDecoder(column)) {
          value[key] = column.mapFromDriverValue(value[key]);
        }
      }
    }

    return value as SelectResultFields<S>;
  };

export const jsonBuildObject = <S extends Selection>(
  selection: S,
  ...opts: EnforceMapper<S, Mapper<S>>
): SQLDecoder<SelectResultFields<S>, Record<string, unknown>> => {
  const chunks = Object.entries(selection).map(([key, value]) =>
    sql.raw(`'${key}',`).append(sql`${value}`),
  );

  const obj = sql<
    SelectResultFields<S>
  >`json_build_object(${sql.join(chunks, sql`,`)})`;

  return new SQLDecoder(obj, mapJsonObject(selection, opts[0]));
};

export function jsonAgg<TData, TDriver = unknown>(
  sqlWithDecoder: (AnyColumn | SQL) & DriverValueDecoder<TData, TDriver>,
  filter?: SQL,
): SQLDecoder<TData[], TDriver[]> {
  const statement = sql<
    TData[]
  >`coalesce(json_agg(${sqlWithDecoder}) ${filter ? sql`filter ( where ${filter} )` : undefined}, '[]'::json)`;
  const mapper = (values: TDriver[]) =>
    values.map(sqlWithDecoder.mapFromDriverValue);

  return new SQLDecoder(statement, mapper);
}
