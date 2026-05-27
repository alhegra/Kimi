import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { subscribers } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const subscribersRouter = createRouter({
  subscribe: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, input.email))
        .limit(1);

      if (existing[0]) {
        return { success: true, message: "Already subscribed" };
      }

      await db.insert(subscribers).values({
        email: input.email,
        source: input.source ?? "website",
      });
      return { success: true, message: "Subscribed successfully" };
    }),

  list: authedQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const result = await db
        .select()
        .from(subscribers)
        .orderBy(desc(subscribers.createdAt))
        .limit(limit)
        .offset(offset);

      const total = await db.select({ count: count() }).from(subscribers);

      return {
        subscribers: result,
        total: total[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  unsubscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(subscribers)
        .set({ status: "unsubscribed" })
        .where(eq(subscribers.email, input.email));
      return { success: true };
    }),

  stats: authedQuery.query(async () => {
    const db = getDb();
    const total = await db.select({ count: count() }).from(subscribers);
    const active = await db
      .select({ count: count() })
      .from(subscribers)
      .where(eq(subscribers.status, "active"));
    return {
      total: total[0]?.count ?? 0,
      active: active[0]?.count ?? 0,
    };
  }),
});
