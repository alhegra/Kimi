import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tags, postTags } from "@db/schema";
import { eq, count } from "drizzle-orm";

export const tagsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(tags).orderBy(tags.name);
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(tags).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(postTags).where(eq(postTags.tagId, input.id));
      await db.delete(tags).where(eq(tags.id, input.id));
      return { success: true };
    }),

  getWithPostCount: publicQuery.query(async () => {
    const db = getDb();
    const allTags = await db.select().from(tags).orderBy(tags.name);
    const result = [];
    for (const tag of allTags) {
      const postCount = await db
        .select({ count: count() })
        .from(postTags)
        .where(eq(postTags.tagId, tag.id));
      result.push({ ...tag, postCount: postCount[0]?.count ?? 0 });
    }
    return result;
  }),
});
