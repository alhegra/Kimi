import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { faqs } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const faqsRouter = createRouter({
  list: publicQuery
    .input(z.object({ postId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.postId) {
        return db
          .select()
          .from(faqs)
          .where(eq(faqs.postId, input.postId))
          .orderBy(asc(faqs.order));
      }
      return db.select().from(faqs).orderBy(asc(faqs.order));
    }),

  create: authedQuery
    .input(
      z.object({
        postId: z.number().optional(),
        question: z.string().min(1),
        answer: z.string().min(1),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(faqs).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(faqs).set(data).where(eq(faqs.id, id));
      return { id, ...data };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(faqs).where(eq(faqs.id, input.id));
      return { success: true };
    }),

  generateFromContent: publicQuery
    .input(z.object({ content: z.string().min(50) }))
    .query(async ({ input }) => {
      const sentences = input.content.split(/[.!?؟!]/).filter((s) => s.trim().length > 20);
      const generatedFAQs = [];

      for (let i = 0; i < Math.min(5, sentences.length); i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 30) {
          const words = sentence.split(/\s+/);
          const keyPhrase = words.slice(0, Math.min(6, words.length)).join(" ");
          generatedFAQs.push({
            question: `ما هو ${keyPhrase}؟`,
            answer: sentence + ".",
            order: i,
          });
        }
      }

      if (generatedFAQs.length === 0) {
        generatedFAQs.push({
          question: "ما هو الموضوع الرئيسي؟",
          answer: input.content.slice(0, 200) + "...",
          order: 0,
        });
      }

      return generatedFAQs;
    }),
});
