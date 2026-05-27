import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, categories, tags, postTags, users, faqs, comments } from "@db/schema";
import { eq, desc, like, and, sql, count, gte, isNotNull } from "drizzle-orm";

export const postsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.string().optional(),
        categoryId: z.number().optional(),
        search: z.string().optional(),
        tagSlug: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const conditions = [];
      conditions.push(isNotNull(posts.id));

      if (input?.status) {
        conditions.push(eq(posts.status, input.status as "draft" | "published" | "scheduled" | "deleted"));
      }
      if (input?.categoryId) {
        conditions.push(eq(posts.categoryId, input.categoryId));
      }
      if (input?.search) {
        conditions.push(like(posts.title, `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          featuredImage: posts.featuredImage,
          status: posts.status,
          viewCount: posts.viewCount,
          readingTime: posts.readingTime,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
          authorName: users.name,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(whereClause)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(posts)
        .where(whereClause);

      return {
        posts: result,
        total: totalResult[0]?.count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((totalResult[0]?.count ?? 0) / limit),
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          content: posts.content,
          featuredImage: posts.featuredImage,
          status: posts.status,
          seoTitle: posts.seoTitle,
          seoDescription: posts.seoDescription,
          seoKeywords: posts.seoKeywords,
          metaRobots: posts.metaRobots,
          canonicalUrl: posts.canonicalUrl,
          ogImage: posts.ogImage,
          readingTime: posts.readingTime,
          viewCount: posts.viewCount,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
          authorName: users.name,
          authorEmail: users.email,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.slug, input.slug))
        .limit(1);

      return result[0] ?? null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        featuredImage: z.string().optional(),
        status: z.enum(["draft", "published", "scheduled"]).default("draft"),
        categoryId: z.number().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        metaRobots: z.string().optional(),
        tagIds: z.array(z.number()).optional(),
        publishedAt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const authorId = ctx.user.id;

      const result = await db.insert(posts).values({
        ...input,
        authorId,
        publishedAt: input.status === "published" ? new Date() : input.publishedAt ? new Date(input.publishedAt) : undefined,
      });

      const postId = Number(result[0].insertId);

      if (input.tagIds && input.tagIds.length > 0) {
        await db.insert(postTags).values(
          input.tagIds.map((tagId) => ({ postId, tagId }))
        );
      }

      return { id: postId, ...input };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        featuredImage: z.string().optional(),
        status: z.enum(["draft", "published", "scheduled", "deleted"]).optional(),
        categoryId: z.number().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        metaRobots: z.string().optional(),
        tagIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, tagIds, ...data } = input;

      await db.update(posts).set(data).where(eq(posts.id, id));

      if (tagIds) {
        await db.delete(postTags).where(eq(postTags.postId, id));
        if (tagIds.length > 0) {
          await db.insert(postTags).values(
            tagIds.map((tagId) => ({ postId: id, tagId }))
          );
        }
      }

      return { id, ...data };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(posts).set({ status: "deleted" }).where(eq(posts.id, input.id));
      return { success: true };
    }),

  getTags: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, input.postId));
      return result;
    }),

  getFAQs: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(faqs)
        .where(eq(faqs.postId, input.postId))
        .orderBy(faqs.order);
    }),

  getComments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.postId, input.postId),
            eq(comments.status, "approved")
          )
        )
        .orderBy(desc(comments.createdAt));
    }),

  addComment: publicQuery
    .input(
      z.object({
        postId: z.number(),
        authorName: z.string().min(1),
        authorEmail: z.string().email(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(comments).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  incrementViews: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(posts)
        .set({ viewCount: sql`${posts.viewCount} + 1` })
        .where(eq(posts.id, input.id));
      return { success: true };
    }),

  getRelated: publicQuery
    .input(z.object({ postId: z.number(), limit: z.number().default(3) }))
    .query(async ({ input }) => {
      const db = getDb();
      const currentPost = await db
        .select({ categoryId: posts.categoryId })
        .from(posts)
        .where(eq(posts.id, input.postId))
        .limit(1);

      if (!currentPost[0]?.categoryId) return [];

      return db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          featuredImage: posts.featuredImage,
          publishedAt: posts.publishedAt,
          readingTime: posts.readingTime,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(
          and(
            eq(posts.categoryId, currentPost[0].categoryId),
            eq(posts.status, "published"),
            sql`${posts.id} != ${input.postId}`
          )
        )
        .orderBy(desc(posts.publishedAt))
        .limit(input.limit);
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const totalPosts = await db.select({ count: count() }).from(posts);
    const publishedPosts = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.status, "published"));
    const totalViews = await db
      .select({ total: sql<number>`SUM(${posts.viewCount})` })
      .from(posts);

    return {
      totalPosts: totalPosts[0]?.count ?? 0,
      publishedPosts: publishedPosts[0]?.count ?? 0,
      totalViews: totalViews[0]?.total ?? 0,
    };
  }),

  trending: publicQuery
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          featuredImage: posts.featuredImage,
          viewCount: posts.viewCount,
          publishedAt: posts.publishedAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.viewCount))
        .limit(input?.limit ?? 5);
    }),
});
