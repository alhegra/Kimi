import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, categories, tags } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const seoRouter = createRouter({
  sitemap: publicQuery.query(async () => {
    const db = getDb();

    const publishedPosts = await db
      .select({
        slug: posts.slug,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt));

    const allCategories = await db.select({ slug: categories.slug }).from(categories);
    const allTags = await db.select({ slug: tags.slug }).from(tags);

    const siteUrl = "https://katib.blog";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${siteUrl}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    for (const cat of allCategories) {
      xml += `  <url>\n    <loc>${siteUrl}/category/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    for (const tag of allTags) {
      xml += `  <url>\n    <loc>${siteUrl}/tag/${tag.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.4</priority>\n  </url>\n`;
    }

    for (const post of publishedPosts) {
      const date = post.publishedAt || post.updatedAt;
      const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${siteUrl}/article/${post.slug}</loc>\n    <lastmod>${isoDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }),

  rss: publicQuery.query(async () => {
    const db = getDb();

    const publishedPosts = await db
      .select({
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
        authorName: posts.authorId,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(20);

    const siteUrl = "https://katib.blog";
    const now = new Date().toUTCString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>KATIB - مدونة المحتوى الذكية</title>\n`;
    rss += `    <link>${siteUrl}</link>\n`;
    rss += `    <description>أحدث المقالات والأخبار في عالم المحتوى والتسويق</description>\n`;
    rss += `    <language>ar</language>\n`;
    rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    rss += `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

    for (const post of publishedPosts) {
      const date = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now;
      rss += `    <item>\n`;
      rss += `      <title>${post.title}</title>\n`;
      rss += `      <link>${siteUrl}/article/${post.slug}</link>\n`;
      rss += `      <guid>${siteUrl}/article/${post.slug}</guid>\n`;
      rss += `      <pubDate>${date}</pubDate>\n`;
      rss += `      <description>${post.excerpt || ""}</description>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>`;
    return rss;
  }),
});
