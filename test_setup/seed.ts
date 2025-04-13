import { DrizzleDB } from "./db";
import { userTable, postTable } from "./schema"; // Adjust this import path as needed

// Hardcoded test users
const testUsers = [
  { name: "John Doe" },
  { name: "Jane Smith" },
  { name: "Alex Johnson" },
  { name: "Maria Garcia" },
  { name: "Robert Chen" },
  { name: "Sarah Williams" },
  { name: "David Brown" },
  { name: "Emily Davis" },
  { name: "Michael Wilson" },
  { name: "Olivia Martinez" },
];

// Hardcoded test posts content
const testPostsContent = [
  "This is my first post in the system. Just testing things out.",
  "I've been working on this project for weeks now. Really excited to share the results soon!",
  "Has anyone else noticed how beautiful the weather has been lately?",
  "Just finished reading a great book on database design. Highly recommend it.",
  "Thinking about the architecture of our new system. Any thoughts on using PostgreSQL?",
  "Today I learned about Drizzle ORM. It seems like a great alternative to other ORMs.",
  "Working from home has its challenges, but I'm getting better at managing my time.",
  "Just deployed my first application using Docker. The experience was smoother than expected.",
  "Looking for recommendations on good tech podcasts. Anyone have suggestions?",
  "Spent the weekend refactoring some legacy code. It's so satisfying to clean things up.",
];

const getSeedContent = (userId: number, i: number) =>
  Array.from({ length: (i % 3) + 1 }, () => ({
    content:
      testPostsContent[Math.floor(Math.random() * testPostsContent.length)]!,
    authorId: userId,
  }));

export async function seed(db: DrizzleDB) {
  const users = (await db
    .insert(userTable)
    .values(testUsers)
    .returning()) as Array<
    typeof userTable.$inferSelect & {
      posts: Array<typeof postTable.$inferSelect>;
    }
  >;

  await Promise.all(
    users.map(async (user, i) => {
      const contents = getSeedContent(user.id, i);

      const posts = await db.insert(postTable).values(contents).returning();
      user["posts"] = posts;
    }),
  );

  return users;
}
