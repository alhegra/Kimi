import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SEOMeta from "@/components/SEOMeta";
import { Search } from "lucide-react";

export default function Blog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);

  const { data: postsData, isLoading } = trpc.posts.list.useQuery({
    page,
    limit: 9,
    status: "published",
    search: search || undefined,
    categoryId: activeCategory,
  });

  const { data: categories } = trpc.categories.list.useQuery();

  return (
    <>
      <SEOMeta
        title="المدونة - KATIB"
        description="تصفح جميع مقالاتنا في مجالات SEO والتسويق والذكاء الاصطناعي والتجارة الإلكترونية"
        canonical="https://katib.blog/blog"
        ogType="website"
      />
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />

        <section className="pt-28 pb-12">
          <div className="max-w-[1400px] mx-auto px-6">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3">
              المدونة
            </h1>
            <p className="text-[#a1a1a1] text-lg mb-8">
              تعلم كيفية تحسين محتواك وزيادة حركة المرور
            </p>

            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field w-full pr-12"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => { setActiveCategory(undefined); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !activeCategory
                    ? "bg-[rgba(125,211,252,0.1)] text-[#7DD3FC] border border-[rgba(125,211,252,0.2)]"
                    : "bg-[#171717] text-[#a1a1a1] border border-[#2a2a2a] hover:text-white"
                }`}
              >
                الكل
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-[rgba(125,211,252,0.1)] text-[#7DD3FC] border border-[rgba(125,211,252,0.2)]"
                      : "bg-[#171717] text-[#a1a1a1] border border-[#2a2a2a] hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
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

                {/* Pagination */}
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
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
