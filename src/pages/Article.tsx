import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SEOMeta from "@/components/SEOMeta";
import {
  generateArticleSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Copy,
  Check,
  User,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [commentForm, setCommentForm] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const { data: article, isLoading } = trpc.posts.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const utils = trpc.useUtils();

  const { data: relatedPosts } = trpc.posts.getRelated.useQuery(
    { postId: article?.id ?? 0, limit: 3 },
    { enabled: !!article?.id }
  );

  const { data: faqs } = trpc.posts.getFAQs.useQuery(
    { postId: article?.id ?? 0 },
    { enabled: !!article?.id }
  );

  const { data: comments } = trpc.posts.getComments.useQuery(
    { postId: article?.id ?? 0 },
    { enabled: !!article?.id }
  );

  const addComment = trpc.posts.addComment.useMutation({
    onSuccess: () => {
      utils.posts.getComments.invalidate({ postId: article?.id ?? 0 });
      setCommentForm({ authorName: "", authorEmail: "", content: "" });
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 3000);
    },
  });

  const incrementViews = trpc.posts.incrementViews.useMutation();

  useEffect(() => {
    if (article?.id) {
      incrementViews.mutate({ id: article.id });
    }
  }, [article?.id]);

  const formattedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const schema = useMemo(() => {
    if (!article) return undefined;
    const articleSchema = generateArticleSchema(
      article.title,
      article.excerpt || "",
      article.slug,
      article.authorName || "KATIB",
      article.publishedAt,
      article.updatedAt,
      article.ogImage || article.featuredImage
    );

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "الرئيسية", url: "https://katib.blog/" },
      { name: "المدونة", url: "https://katib.blog/blog" },
      { name: article.title, url: `https://katib.blog/article/${article.slug}` },
    ]);

    const schemas = [articleSchema, breadcrumbSchema];

    if (faqs && faqs.length > 0) {
      schemas.push(generateFAQSchema(faqs));
    }

    return {
      "@context": "https://schema.org",
      "@graph": schemas,
    };
  }, [article, faqs]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || "",
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-28 pb-12 max-w-[720px] mx-auto px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#171717] rounded w-3/4" />
            <div className="h-4 bg-[#171717] rounded w-1/2" />
            <div className="h-64 bg-[#171717] rounded mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-28 pb-12 text-center">
          <h1 className="text-white text-2xl font-bold mb-4">المقال غير موجود</h1>
          <Link to="/blog" className="text-[#7DD3FC] hover:underline">
            العودة إلى المدونة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.excerpt || undefined}
        canonical={`https://katib.blog/article/${article.slug}`}
        ogImage={article.ogImage || article.featuredImage || undefined}
        ogType="article"
        robots={article.metaRobots || "index,follow"}
        keywords={article.seoKeywords || undefined}
        schema={schema}
      />
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />

        <article className="pt-28 pb-12">
          <div className="max-w-[720px] mx-auto px-6">
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
              <span className="text-[#a1a1a1]">{article.title}</span>
            </div>

            {/* Meta */}
            {article.categoryName && (
              <Link
                to={`/category/${article.categorySlug}`}
                className="inline-block px-3 py-1 bg-[rgba(125,211,252,0.1)] text-[#7DD3FC] text-xs font-medium rounded-md mb-4"
              >
                {article.categoryName}
              </Link>
            )}

            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-[#a1a1a1] text-lg mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-[#666666] text-sm mb-8 pb-8 border-b border-[#2a2a2a]">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {article.authorName || "KATIB"}
              </span>
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formattedDate}
                </span>
              )}
              {article.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {article.readingTime} دقائق قراءة
                </span>
              )}
              {article.viewCount !== null && (
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {article.viewCount.toLocaleString("ar-SA")} مشاهدة
                </span>
              )}
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full rounded-xl mb-8 object-cover max-h-[400px]"
              />
            )}

            {/* Content */}
            {article.content && (
              <div
                className="markdown-body mb-12"
                dangerouslySetInnerHTML={{
                  __html: article.content
                    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
                    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/^- (.*$)/gim, "<li>$1</li>")
                    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
                    .replace(/\n/g, "<br />")
                    .replace(/<br \/>(<h[12])/g, "$1")
                    .replace(/<\/h([12])><br \/>/g, "</h$1>"),
                }}
              />
            )}

            {/* Keywords */}
            {article.seoKeywords && (
              <div className="mb-8 pb-8 border-b border-[#2a2a2a]">
                <h3 className="text-white text-sm font-semibold mb-3">
                  الكلمات المفتاحية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.seoKeywords.split(",").map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#171717] text-[#a1a1a1] text-xs rounded-full border border-[#2a2a2a]"
                    >
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="flex items-center gap-3 mb-12">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-[#2a2a2a] rounded-lg text-[#a1a1a1] text-sm hover:text-white transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "تم النسخ" : "نسخ الرابط"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-[#2a2a2a] rounded-lg text-[#a1a1a1] text-sm hover:text-white transition-colors"
              >
                <Share2 size={16} />
                مشاركة
              </button>
            </div>

            {/* FAQs */}
            {faqs && faqs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-white text-2xl font-bold mb-6">
                  الأسئلة الشائعة
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="bg-[#171717] border border-[#2a2a2a] rounded-xl group"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer text-white font-medium list-none">
                        {faq.question}
                        <span className="text-[#666666] group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="px-5 pb-5 text-[#a1a1a1] leading-relaxed">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mb-12">
              <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare size={24} />
                التعليقات ({comments?.length ?? 0})
              </h2>

              {/* Comment Form */}
              <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 mb-8">
                <h3 className="text-white text-sm font-semibold mb-4">
                  أضف تعليقاً
                </h3>
                {commentSubmitted && (
                  <div className="bg-[rgba(45,212,191,0.1)] border border-[#2DD4BF] text-[#2DD4BF] px-4 py-3 rounded-lg text-sm mb-4">
                    تم إرسال تعليقك بنجاح! سيتم مراجعته قبل النشر.
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="الاسم"
                      value={commentForm.authorName}
                      onChange={(e) =>
                        setCommentForm({ ...commentForm, authorName: e.target.value })
                      }
                      className="input-field w-full"
                    />
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={commentForm.authorEmail}
                      onChange={(e) =>
                        setCommentForm({ ...commentForm, authorEmail: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>
                  <textarea
                    placeholder="اكتب تعليقك هنا..."
                    value={commentForm.content}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, content: e.target.value })
                    }
                    rows={4}
                    className="input-field w-full py-3 resize-none"
                  />
                  <button
                    onClick={() => {
                      if (
                        article?.id &&
                        commentForm.authorName &&
                        commentForm.authorEmail &&
                        commentForm.content
                      ) {
                        addComment.mutate({
                          postId: article.id,
                          ...commentForm,
                        });
                      }
                    }}
                    disabled={addComment.isPending}
                    className="btn-primary disabled:opacity-50"
                  >
                    {addComment.isPending ? "جاري الإرسال..." : "إرسال التعليق"}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {comment.authorName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-white text-sm font-medium">
                          {comment.authorName}
                        </span>
                        <span className="text-[#666666] text-xs">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString("ar-SA")
                            : ""}
                        </span>
                      </div>
                      <p className="text-[#a1a1a1] text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666666] text-sm text-center py-8">
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="bg-[#171717] py-16">
            <div className="max-w-[1400px] mx-auto px-6">
              <h2 className="text-white text-2xl font-bold mb-8">
                مقالات ذات صلة
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedPosts.map((post) => (
                  <ArticleCard key={post.id} article={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
