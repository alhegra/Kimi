import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

function extractKeywords(text: string, count: number = 10): string[] {
  const stopWords = new Set([
    "في", "من", "إلى", "على", "هذا", "هذه", "التي", "الذي", "و", "أو", "لا", "ما", "مع", "عن", "كان", "قد", "كل", "بعد", "قبل", "بين", "أن", "لم", "تم", "ها", "هو", "هي", "هم", "the", "and", "or", "is", "are", "was", "were", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

function calculateReadingTime(text: string): number {
  const arabicWords = text.split(/\s+/).filter((w) => /[\u0600-\u06FF]/.test(w)).length;
  const otherWords = text.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;
  const minutes = Math.ceil(arabicWords / 200 + otherWords / 250);
  return Math.max(1, minutes);
}

export const aiRouter = createRouter({
  generateExcerpt: publicQuery
    .input(z.object({ content: z.string().min(10) }))
    .query(async ({ input }) => {
      const clean = input.content.replace(/[#*`\-_>]/g, " ").trim();
      const sentences = clean.split(/[.!?؟!]/).filter((s) => s.trim().length > 20);
      if (sentences.length === 0) return clean.slice(0, 160);
      const excerpt = sentences.slice(0, 2).join(". ").trim();
      return excerpt.length > 160 ? excerpt.slice(0, 157) + "..." : excerpt;
    }),

  generateKeywords: publicQuery
    .input(z.object({ content: z.string().min(10), count: z.number().default(10) }))
    .query(async ({ input }) => {
      return extractKeywords(input.content, input.count);
    }),

  generateTags: publicQuery
    .input(z.object({ content: z.string().min(10), count: z.number().default(5) }))
    .query(async ({ input }) => {
      const keywords = extractKeywords(input.content, input.count * 2);
      return keywords.slice(0, input.count).map((k) => ({
        name: k,
        slug: k.replace(/\s+/g, "-"),
      }));
    }),

  generateSEOTitle: publicQuery
    .input(z.object({ title: z.string().min(1), maxLength: z.number().default(60) }))
    .query(async ({ input }) => {
      const clean = input.title.trim();
      if (clean.length <= input.maxLength) return clean;
      return clean.slice(0, input.maxLength - 3) + "...";
    }),

  generateSEODescription: publicQuery
    .input(z.object({ content: z.string().min(10), maxLength: z.number().default(160) }))
    .query(async ({ input }) => {
      const clean = input.content.replace(/[#*`\-_>]/g, " ").trim();
      const sentences = clean.split(/[.!?؟!]/).filter((s) => s.trim().length > 20);
      let desc = sentences.slice(0, 2).join(". ").trim();
      if (desc.length > input.maxLength) {
        desc = desc.slice(0, input.maxLength - 3) + "...";
      }
      return desc;
    }),

  generateFAQs: publicQuery
    .input(z.object({ content: z.string().min(50) }))
    .query(async ({ input }) => {
      const sentences = input.content
        .replace(/[#*`\-_>]/g, " ")
        .split(/[.!?؟!]/)
        .filter((s) => s.trim().length > 30);

      const faqs = [];
      const usedPhrases = new Set();

      for (let i = 0; i < Math.min(5, sentences.length); i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(/\s+/).filter((w) => w.length > 2);
        const phrase = words.slice(0, Math.min(4, words.length)).join(" ");

        if (phrase && !usedPhrases.has(phrase)) {
          usedPhrases.add(phrase);
          faqs.push({
            question: `ما هو ${phrase}؟`,
            answer: sentence + ".",
            order: i,
          });
        }
      }

      if (faqs.length === 0) {
        faqs.push({
          question: "ما هو الموضوع الرئيسي؟",
          answer: input.content.slice(0, 200) + "...",
          order: 0,
        });
      }

      return faqs;
    }),

  generateSchema: publicQuery
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        authorName: z.string().optional(),
        publishedAt: z.string().optional(),
        modifiedAt: z.string().optional(),
        image: z.string().optional(),
        siteName: z.string().default("KATIB"),
        siteUrl: z.string().default("https://katib.blog"),
      })
    )
    .query(async ({ input }) => {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: input.title,
        description: input.description,
        image: input.image ? [input.image] : undefined,
        datePublished: input.publishedAt,
        dateModified: input.modifiedAt || input.publishedAt,
        author: {
          "@type": "Person",
          name: input.authorName || "KATIB",
        },
        publisher: {
          "@type": "Organization",
          name: input.siteName,
          logo: {
            "@type": "ImageObject",
            url: `${input.siteUrl}/logo.png`,
          },
        },
        url: `${input.siteUrl}/article/${input.slug}`,
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: input.siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: input.title,
            item: `${input.siteUrl}/article/${input.slug}`,
          },
        ],
      };

      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: input.siteName,
        url: input.siteUrl,
        logo: `${input.siteUrl}/logo.png`,
      };

      return {
        article: JSON.stringify(articleSchema),
        breadcrumb: JSON.stringify(breadcrumbSchema),
        organization: JSON.stringify(orgSchema),
      };
    }),

  suggestSEO: publicQuery
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const suggestions = [];
      const score = { max: 100, current: 0 };

      if (!input.seoTitle || input.seoTitle.length < 10) {
        suggestions.push({
          type: "error",
          field: "seoTitle",
          message: "عنوان SEO قصير جداً. يجب أن يكون بين 30-60 حرفاً.",
        });
      } else if (input.seoTitle.length > 60) {
        suggestions.push({
          type: "warning",
          field: "seoTitle",
          message: "عنوان SEO طويل جداً. يجب أن يكون أقل من 60 حرفاً.",
        });
        score.current += 10;
      } else {
        score.current += 15;
      }

      if (!input.seoDescription || input.seoDescription.length < 50) {
        suggestions.push({
          type: "error",
          field: "seoDescription",
          message: "وصف SEO قصير جداً. يجب أن يكون بين 50-160 حرفاً.",
        });
      } else if (input.seoDescription.length > 160) {
        suggestions.push({
          type: "warning",
          field: "seoDescription",
          message: "وصف SEO طويل جداً. يجب أن يكون أقل من 160 حرفاً.",
        });
        score.current += 10;
      } else {
        score.current += 15;
      }

      if (input.title.length < 10) {
        suggestions.push({
          type: "warning",
          field: "title",
          message: "عنوان المقالة قصير. فكر في إضافة كلمات مفتاحية.",
        });
      } else {
        score.current += 10;
      }

      if (input.content.length < 300) {
        suggestions.push({
          type: "warning",
          field: "content",
          message: "المحتوى قصير. المحتوى الطويل (1000+ كلمة) يصنف أفضل في SEO.",
        });
      } else {
        score.current += 20;
      }

      const wordCount = input.content.split(/\s+/).length;
      if (wordCount < 3) {
        suggestions.push({
          type: "error",
          field: "keywords",
          message: "أضف كلمات مفتاحية في المحتوى.",
        });
      } else {
        score.current += 20;
      }

      const headers = (input.content.match(/^#{2,3}\s+/gm) || []).length;
      if (headers < 2) {
        suggestions.push({
          type: "warning",
          field: "headings",
          message: "أضف عناوين فرعية (H2, H3) لتنظيم المحتوى وتحسين SEO.",
        });
      } else {
        score.current += 10;
      }

      const images = (input.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
      if (images === 0) {
        suggestions.push({
          type: "warning",
          field: "images",
          message: "أضف صوراً مع نص بديل (alt text) لتحسين SEO.",
        });
      } else {
        score.current += 10;
      }

      return {
        score: score.current,
        maxScore: score.max,
        grade: score.current >= 80 ? "A" : score.current >= 60 ? "B" : score.current >= 40 ? "C" : "D",
        suggestions,
      };
    }),

  readingTime: publicQuery
    .input(z.object({ content: z.string() }))
    .query(async ({ input }) => {
      return calculateReadingTime(input.content);
    }),
});
