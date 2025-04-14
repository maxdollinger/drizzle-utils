import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import * as Schema from "./schema";
import { migrate } from "drizzle-orm/pglite/migrator";
import { seed } from "./seed";

export type DrizzleDB = PgliteDatabase<typeof Schema>;

export const getDB = async () => {
  const drizzleDB = drizzle({
    schema: Schema,
    logger: true,
  });

  await migrate(drizzleDB, { migrationsFolder: "./drizzle/" });

  const seedData = await seed(drizzleDB);

  return {
    db: drizzleDB,
    seed: seedData,
  };
};
