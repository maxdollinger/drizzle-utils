export const isDefined = <T extends {} | null | undefined>(
  value: T,
): value is T & {} => value !== null && value !== undefined;
