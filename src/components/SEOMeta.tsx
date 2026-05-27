import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  keywords?: string;
  schema?: Record<string, unknown>;
}

export default function SEOMeta({
  title,
  description = "منصة KATIB لإدارة المحتوى الذكي - أنشئ ونشر وحلل مقالاتك بكفاءة",
  canonical,
  ogImage,
  ogType = "article",
  robots = "index,follow",
  keywords,
  schema,
}: SEOMetaProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content?: string | null) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(name.startsWith("og:") || name.startsWith("twitter:") ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("robots", robots);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", ogType);
    if (ogImage) setMeta("og:image", ogImage);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (schema) {
      const schemaId = "json-ld-schema";
      let script = document.getElementById(schemaId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = schemaId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    return () => {
      const schemaScript = document.getElementById("json-ld-schema");
      if (schemaScript) schemaScript.remove();
    };
  }, [title, description, canonical, ogImage, ogType, robots, keywords, schema]);

  return null;
}
