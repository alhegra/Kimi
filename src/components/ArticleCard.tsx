import { Link } from "react-router";
import { Clock, Eye } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    publishedAt?: Date | null;
    readingTime?: number | null;
    viewCount?: number | null;
    categoryName?: string | null;
    categorySlug?: string | null;
  };
  featured?: boolean;
}

export default function ArticleCard({ article, featured }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link
      to={`/article/${article.slug}`}
      className={`group block bg-[#171717] border border-[#2a2a2a] rounded-xl overflow-hidden card-hover ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-0" : ""
      }`}
    >
      <div
        className={`bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f] flex items-center justify-center ${
          featured ? "h-48 md:h-full" : "h-44"
        }`}
      >
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-[#2a2a2a] text-6xl font-bold select-none">
            K
          </div>
        )}
      </div>

      <div className="p-5">
        {article.categoryName && (
          <span className="inline-block px-2.5 py-1 bg-[rgba(125,211,252,0.1)] text-[#7DD3FC] text-[11px] font-medium rounded-md mb-3">
            {article.categoryName}
          </span>
        )}

        <h3 className="text-white font-semibold text-base leading-relaxed mb-2 line-clamp-2 group-hover:text-[#7DD3FC] transition-colors">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-[#a1a1a1] text-sm leading-relaxed line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-[#666666] text-xs">
          {formattedDate && <span>{formattedDate}</span>}
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.readingTime} دقائق
            </span>
          )}
          {article.viewCount !== undefined && article.viewCount !== null && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {article.viewCount.toLocaleString("ar-SA")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
