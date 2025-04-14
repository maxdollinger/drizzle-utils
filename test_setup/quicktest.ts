import { sql } from "drizzle-orm";
import { getDB } from "./db";

const main = async () => {
  const { db } = await getDB();

  const statement = sql`generate_series('2025-04-01','2025-04-30', interval '1 day') as date`;

  const result = await db.execute(
    sql`select * from ( select ${statement}) where extract(dow from "date") not in (0,6) ;`,
  );

  return result.rows;
};

main().then((result) => console.log("result: \n\n", result));
