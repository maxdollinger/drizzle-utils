export class DatabaseError extends Error {
  public readonly _tag = "databaseError";
  public constructor(msg: string, opts?: ErrorOptions) {
    super(msg, opts);
  }
}
