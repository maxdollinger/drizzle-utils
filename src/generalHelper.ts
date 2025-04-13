export const isDefined = <T extends {} | null | undefined>(
  value: T,
): value is T & {} => value !== null && value !== undefined;

export const ensureDefined = <T>(value: T): T & {} => {
  if (value === null || value === undefined) {
    throw new Error("value is not defined");
  }

  return value;
};
