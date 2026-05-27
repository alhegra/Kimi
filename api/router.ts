import { authRouter } from "./auth-router";
import { postsRouter } from "./routers/posts";
import { categoriesRouter } from "./routers/categories";
import { tagsRouter } from "./routers/tags";
import { settingsRouter } from "./routers/settings";
import { faqsRouter } from "./routers/faqs";
import { subscribersRouter } from "./routers/subscribers";
import { aiRouter } from "./routers/ai";
import { uploadRouter } from "./routers/upload";
import { seoRouter } from "./routers/seo";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
  settings: settingsRouter,
  faqs: faqsRouter,
  subscribers: subscribersRouter,
  ai: aiRouter,
  upload: uploadRouter,
  seo: seoRouter,
});

export type AppRouter = typeof appRouter;
