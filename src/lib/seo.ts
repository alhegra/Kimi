export function generateSlug(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function generateSEOMeta(
  title: string,
  description?: string,
  options?: {
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    robots?: string;
    keywords?: string;
    schema?: Record<string, unknown>;
  }
) {
  const meta: Record<string, string> = {
    title,
    description: description || "",
  };

  if (options?.robots) meta.robots = options.robots;
  if (options?.canonical) meta.canonical = options.canonical;
  if (options?.keywords) meta.keywords = options.keywords;

  const ogTags: Record<string, string> = {
    "og:title": title,
    "og:description": description || "",
    "og:type": options?.ogType || "article",
  };
  if (options?.ogImage) ogTags["og:image"] = options.ogImage;

  const twitterTags: Record<string, string> = {
    "twitter:card": options?.twitterCard || "summary_large_image",
    "twitter:title": title,
    "twitter:description": description || "",
  };
  if (options?.ogImage) twitterTags["twitter:image"] = options.ogImage;

  return { meta, og: ogTags, twitter: twitterTags, schema: options?.schema };
}

export function generateArticleSchema(
  title: string,
  description: string,
  slug: string,
  authorName: string,
  publishedAt?: Date | null,
  modifiedAt?: Date | null,
  image?: string | null,
  siteUrl = "https://katib.blog"
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    dateModified: modifiedAt ? new Date(modifiedAt).toISOString() : undefined,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "KATIB",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    url: `${siteUrl}/article/${slug}`,
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema(siteUrl = "https://katib.blog") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KATIB",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "منصة إدارة محتوى ذكية",
    sameAs: [],
  };
}
