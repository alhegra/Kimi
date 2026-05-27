import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key))
        .limit(1);
      return result[0]?.value ?? null;
    }),

  getAll: publicQuery.query(async () => {
    const db = getDb();
    const allSettings = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const s of allSettings) {
      result[s.key] = s.value ?? "";
    }
    return result;
  }),

  set: authedQuery
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key))
        .limit(1);

      if (existing[0]) {
        await db
          .update(settings)
          .set({ value: input.value })
          .where(eq(settings.key, input.key));
      } else {
        await db.insert(settings).values(input);
      }
      return { success: true };
    }),

  setMany: authedQuery
    .input(z.record(z.string()))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const [key, value] of Object.entries(input)) {
        const existing = await db
          .select()
          .from(settings)
          .where(eq(settings.key, key))
          .limit(1);

        if (existing[0]) {
          await db
            .update(settings)
            .set({ value })
            .where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value });
        }
      }
      return { success: true };
    }),
});
