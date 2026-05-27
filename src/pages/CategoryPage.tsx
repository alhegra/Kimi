import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SEOMeta from "@/components/SEOMeta";
import { useState } from "react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allTags } = trpc.tags.list.useQuery();

  const isTagPage = window.location.pathname.startsWith("/tag/");

  const category = categories?.find((c) => c.slug === slug);
  const tag = allTags?.find((t) => t.slug === slug);

  const { data: postsData, isLoading } = trpc.posts.list.useQuery({
    page,
    limit: 9,
    status: "published",
    categoryId: category?.id,
  });

  const title = isTagPage ? tag?.name : category?.name;
  const description = isTagPage
    ? `مقالات موسومة بـ "${tag?.name}"`
    : category?.description || `مقالات في فئة "${category?.name}"`;

  return (
    <>
      <SEOMeta
        title={`${title || slug} - KATIB`}
        description={description}
        canonical={`https://katib.blog${isTagPage ? "/tag/" : "/category/"}${slug}`}
        ogType="website"
      />
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />

        <section className="pt-28 pb-12">
          <div className="max-w-[1400px] mx-auto px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[#666666] text-xs mb-6">
              <Link to="/" className="hover:text-[#a1a1a1] transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-[#a1a1a1] transition-colors">
                المدونة
              </Link>
              <span>/</span>
              <span className="text-[#a1a1a1]">{title || slug}</span>
            </div>

            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3">
              {title || slug}
            </h1>
            {description && (
              <p className="text-[#a1a1a1] text-lg mb-8">{description}</p>
            )}

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#171717] border border-[#2a2a2a] rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {postsData?.posts.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {postsData && postsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#171717] border border-[#2a2a2a] rounded-lg text-sm text-[#a1a1a1] disabled:opacity-30 hover:text-white transition-colors"
                    >
                      السابق
                    </button>
                    <span className="text-[#666666] text-sm px-4">
                      صفحة {page} من {postsData.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(postsData.totalPages, page + 1))}
                      disabled={page === postsData.totalPages}
                      className="px-4 py-2 bg-[#171717] border border-[#2a2a2a] rounded-lg text-sm text-[#a1a1a1] disabled:opacity-30 hover:text-white transition-colors"
                    >
                      التالي
                    </button>
                  </div>
                )}

                {postsData?.posts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-[#666666] text-lg">
                      لا توجد مقالات في هذا التصنيف حالياً
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
