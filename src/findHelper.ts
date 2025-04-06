import { DatabaseError } from "./databaseError";
import { isDefined } from "./generalHelper";

export const findFirst = async <T>(
  query: Promise<T[]>,
  error?: Error,
): Promise<T> => {
  const results = await query;

  if (isDefined(results[0])) return results[0];

  throw error ?? new DatabaseError("empty results");
};
