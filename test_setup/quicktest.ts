import { sql } from "drizzle-orm";
import { getDB } from "./db";

const main = async () => {
  const { db } = await getDB();

  const statement = sql`NOW()`;

  const result = await db.execute(sql`select ${statement};`);

  return result.rows;
};

main().then((result) => console.log("result: \n\n", result));
