import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { categories, posts } from "@db/schema";
import { eq, count, desc } from "drizzle-orm";

export const categoriesRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(categories.name);
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(categories).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      return { id, ...data };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),

  getWithPostCount: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(categories.name);
    const result = [];
    for (const cat of cats) {
      const postCount = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.categoryId, cat.id));
      result.push({ ...cat, postCount: postCount[0]?.count ?? 0 });
    }
    return result;
  }),
});
