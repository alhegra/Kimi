import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SEOMeta from "@/components/SEOMeta";
import InkMeshGradient from "@/components/InkMeshGradient";
import {
  generateSEOMeta,
  generateOrganizationSchema,
} from "@/lib/seo";
import {
  Pen,
  BarChart3,
  Share2,
  Sparkles,
  TrendingUp,
  Eye,
  FileText,
  Users,
} from "lucide-react";

export default function Home() {
  const { data: postsData } = trpc.posts.list.useQuery({
    page: 1,
    limit: 6,
    status: "published",
  });
  const { data: stats } = trpc.posts.stats.useQuery();
  const { data: trending } = trpc.posts.trending.useQuery({ limit: 3 });

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [postsData]);

  const seo = generateSEOMeta(
    "KATIB - منصة إدارة محتوى ذكية",
    "منصة KATIB لإدارة المحتوى الذكي - أنشئ ونشر وحلل مقالاتك بكفاءة مع أدوات SEO متقدمة",
    {
      canonical: "https://katib.blog/",
      ogType: "website",
      schema: generateOrganizationSchema("https://katib.blog"),
    }
  );

  return (
    <>
      <SEOMeta
        title={seo.meta.title}
        description={seo.meta.description}
        canonical={seo.meta.canonical}
        ogType={seo.og["og:type"]}
        schema={seo.schema}
      />
      <InkMeshGradient />
      <div className="relative z-10">
        <Header />

        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center pt-16">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <h1 className="text-white text-5xl md:text-7xl lg:text-[80px] font-bold leading-[1.0] tracking-tight mb-6">
              <span className="block animate-fade-in-up">اكتب محتوى</span>
              <span
                className="block animate-fade-in-up text-[#7DD3FC]"
                style={{ animationDelay: "100ms" }}
              >
                بكفاءة عالية
              </span>
            </h1>
            <p
              className="text-[#a1a1a1] text-base md:text-lg max-w-[520px] mx-auto mb-8 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "200ms", opacity: 0 }}
            >
              منصة ذكاء اصطناعي لتوليد المحتوى، وتحسين محركات البحث، والتحليلات
              للفرق التي تنشر بسرعة.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
              style={{ animationDelay: "400ms", opacity: 0 }}
            >
              <Link
                to="/dashboard"
                className="bg-[#7DD3FC] text-[#0a0a0a] px-7 py-3.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
              >
                ابدأ الكتابة مجاناً ←
              </Link>
              <Link
                to="/blog"
                className="btn-secondary px-7 py-3.5"
              >
                استكشف المدونة
              </Link>
            </div>

            {/* Stats preview */}
            <div
              ref={statsRef}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[800px] mx-auto"
            >
              {[
                { label: "مقال منشور", value: stats?.publishedPosts ?? 0, icon: FileText },
                { label: "إجمالي المشاهدات", value: stats?.totalViews ?? 0, icon: Eye },
                { label: "مقالات هذا الشهر", value: stats?.totalPosts ?? 0, icon: TrendingUp },
                { label: "زوار نشطون", value: "∞", icon: Users },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="reveal bg-[rgba(23,23,23,0.6)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl p-5 text-center"
                  style={{ animationDelay: `${500 + i * 100}ms`, opacity: 0 }}
                >
                  <stat.icon className="w-5 h-5 text-[#7DD3FC] mx-auto mb-2" />
                  <div className="text-white text-2xl md:text-3xl font-bold font-mono">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString("ar-SA")
                      : stat.value}
                  </div>
                  <div className="text-[#666666] text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 md:py-32 bg-[#0a0a0a]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-16 reveal" style={{ opacity: 0 }}>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                كل ما تحتاجه لإدارة المحتوى
              </h2>
              <p className="text-[#a1a1a1] max-w-[500px] mx-auto">
                أدوات متكاملة من الكتابة إلى النشر والتحليل
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Pen,
                  title: "كتابة ذكية",
                  desc: "أدوات كتابة مدعومة بالذكاء الاصطناعي لتوليد محتوى عالي الجودة",
                },
                {
                  icon: BarChart3,
                  title: "تحليلات متقدمة",
                  desc: "تتبع أداء مقالاتك مع إحصائيات دقيقة وشاملة",
                },
                {
                  icon: Share2,
                  title: "SEO آلي",
                  desc: "تحسين تلقائي لمحركات البحث مع جميع الوسوم والمخططات",
                },
                {
                  icon: Sparkles,
                  title: "توليد FAQs",
                  desc: "توليد أسئلة شائعة تلقائياً من محتوى مقالاتك",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="reveal bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 card-hover"
                  style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
                >
                  <feature.icon className="w-10 h-10 text-[#7DD3FC] mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#a1a1a1] text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-10 reveal" style={{ opacity: 0 }}>
              <div>
                <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">
                  الأكثر قراءة
                </h2>
                <p className="text-[#a1a1a1]">المقالات الأكثر شعبية هذا الشهر</p>
              </div>
              <Link
                to="/blog"
                className="hidden md:block text-[#7DD3FC] text-sm font-medium hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trending?.map((article, i) => (
                <div
                  key={article.id}
                  className="reveal"
                  style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Posts */}
        <section className="py-24 md:py-32 bg-[#0a0a0a]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-10 reveal" style={{ opacity: 0 }}>
              <div>
                <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">
                  أحدث المقالات
                </h2>
                <p className="text-[#a1a1a1]">تصفح أحدث ما نشرناه</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {postsData?.posts.map((article, i) => (
                <div
                  key={article.id}
                  className="reveal"
                  style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="reveal bg-[#171717] border border-[#2a2a2a] rounded-[20px] p-12 md:p-20 text-center" style={{ opacity: 0 }}>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                جاهز لتوسيع محتواك؟
              </h2>
              <p className="text-[#a1a1a1] max-w-[500px] mx-auto mb-8">
                انضم إلى آلاف الفرق التي تستخدم KATIB لنشر المحتوى بشكل أسرع
                وتحسين SEO والوصول لجمهور أكبر.
              </p>
              <Link
                to="/dashboard"
                className="bg-[#7DD3FC] text-[#0a0a0a] px-8 py-3.5 rounded-lg text-sm font-semibold inline-block hover:brightness-110 transition-all"
              >
                ابدأ مجاناً ←
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
