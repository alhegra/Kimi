import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = createPool(dbUrl);
const db = drizzle(pool, { schema, mode: "planetscale" });

async function seed() {
  console.log("Seeding database...");

  await db.insert(schema.categories).values([
    { name: "SEO", slug: "seo", description: "تحسين محركات البحث" },
    { name: "التسويق", slug: "marketing", description: "استراتيجيات التسويق الرقمي" },
    { name: "الذكاء الاصطناعي", slug: "ai", description: "تقنيات الذكاء الاصطناعي" },
    { name: "التجارة الإلكترونية", slug: "ecommerce", description: "التجارة الإلكترونية" },
    { name: "التقنية", slug: "tech", description: "أخبار التقنية" },
  ]);

  await db.insert(schema.tags).values([
    { name: "SEO", slug: "seo" },
    { name: "محتوى", slug: "content" },
    { name: "تسويق", slug: "marketing" },
    { name: "ذكاء اصطناعي", slug: "artificial-intelligence" },
    { name: "محركات البحث", slug: "search-engines" },
    { name: "google", slug: "google" },
    { name: "استراتيجية", slug: "strategy" },
    { name: "تحسين", slug: "optimization" },
  ]);

  const samplePosts = [
    {
      title: "دليل شامل لتحسين محركات البحث في 2025",
      slug: "دليل-شامل-لتحسين-محركات-البحث-2025",
      excerpt: "تعرف على أحدث استراتيجيات SEO لعام 2025 وكيفية تطبيقها على موقعك لتحقيق أفضل النتائج.",
      content: `# دليل شامل لتحسين محركات البحث في 2025\n\n## مقدمة\n\nتحسين محركات البحث (SEO) هو العملية التي تساعد موقعك على الظهور في نتائج البحث الأولى. في عام 2025، أصبح SEO أكثر أهمية من أي وقت مضى.\n\n## 1. فهم خوارزميات Google\n\nGoogle يحدث خوارزمياته باستمرار. لفهم كيفية عملها:\n\n- ركز على جودة المحتوى\n- حسن تجربة المستخدم\n- اجعل موقعك سريعاً\n\n## 2. البحث عن الكلمات المفتاحية\n\nالكلمات المفتاحية هي أساس SEO. استخدم أدوات مثل:\n\n- Google Keyword Planner\n- SEMrush\n- Ahrefs\n\n## 3. تحسين المحتوى\n\nالمحتوى الجيد هو المحتوى الذي يجيب على أسئلة المستخدمين.\n\n## الخلاصة\n\nSEO هو استثمار طويل المدى. كن صبوراً وثابتاً في جهودك.`,
      status: "published" as const,
      categoryId: 1,
      seoTitle: "دليل شامل لتحسين محركات البحث 2025 | KATIB",
      seoDescription: "تعرف على أحدث استراتيجيات SEO لعام 2025 وكيفية تطبيقها على موقعك.",
      seoKeywords: "SEO, تحسين محركات البحث, Google, 2025",
      readingTime: 8,
      viewCount: 1250,
      publishedAt: new Date("2025-01-10"),
    },
    {
      title: "كيف تكتب محتوى يجذب القراء ويحافظ على اهتمامهم",
      slug: "كيف-تكتب-محتوى-يجذب-القراء",
      excerpt: "تعلم أسرار كتابة المحتوى الجذاب الذي يحافظ على اهتمام القراء من البداية حتى النهاية.",
      content: `# كيف تكتب محتوى يجذب القراء\n\n## ابدأ بعنوان قوي\n\nالعنوان هو أول ما يراه القارئ. اجعله جذاباً وواضحاً.\n\n## استخدم الفقرات القصيرة\n\nالقراء يفضلون الفقرات القصيرة والسهلة. تجنب الكتل النصية الكبيرة.\n\n## أضف أمثلة عملية\n\nالأمثلة تجعل المحتوى أكثر فهماً وتطبيقاً.`,
      status: "published" as const,
      categoryId: 2,
      seoTitle: "كيف تكتب محتوى يجذب القراء | KATIB",
      seoDescription: "تعلم أسرار كتابة المحتوى الجذاب الذي يحافظ على اهتمام القراء.",
      seoKeywords: "كتابة محتوى, محتوى جذاب, كتابة مقالات",
      readingTime: 5,
      viewCount: 890,
      publishedAt: new Date("2025-01-12"),
    },
    {
      title: "أدوات الذكاء الاصطناعي لتحسين المحتوى",
      slug: "أدوات-الذكاء-الاصطناعي-لتحسين-المحتوى",
      excerpt: "استكشف أفضل أدوات الذكاء الاصطناعي التي يمكنها مساعدتك في إنشاء وتحسين محتوى عالي الجودة.",
      content: `# أدوات الذكاء الاصطناعي لتحسين المحتوى\n\n## مقدمة\n\nأصبح الذكاء الاصطناعي جزءاً أساسياً من إنشاء المحتوى الحديث.\n\n## أدوات توليد النصوص\n\n- ChatGPT\n- Claude\n- Jasper\n\n## أدوات تحسين SEO\n\n- Surfer SEO\n- Clearscope\n- MarketMuse`,
      status: "published" as const,
      categoryId: 3,
      seoTitle: "أدوات الذكاء الاصطناعي لتحسين المحتوى | KATIB",
      seoDescription: "استكشف أفضل أدوات الذكاء الاصطناعي لإنشاء محتوى عالي الجودة.",
      seoKeywords: "ذكاء اصطناعي, AI, أدوات محتوى, تحسين محتوى",
      readingTime: 6,
      viewCount: 2100,
      publishedAt: new Date("2025-01-14"),
    },
    {
      title: "استراتيجيات التسويق الرقمي الناجحة",
      slug: "استراتيجيات-التسويق-الرقمي-الناجحة",
      excerpt: "تعرف على أهم استراتيجيات التسويق الرقمي التي تساعدك على النجاح في السوق الرقمي.",
      content: `# استراتيجيات التسويق الرقمي الناجحة\n\n## التسويق عبر محركات البحث\n\nSEO هو أحد أهم قنوات التسويق الرقمي.\n\n## التسويق عبر وسائل التواصل الاجتماعي\n\nتواصل مع جمهورك على المنصات التي يستخدمونها.\n\n## التسويق بالمحتوى\n\nأنشئ محتوى قيماً يجذب عملاءك المحتملين.`,
      status: "published" as const,
      categoryId: 2,
      seoTitle: "استراتيجيات التسويق الرقمي الناجحة | KATIB",
      seoDescription: "تعرف على أهم استراتيجيات التسويق الرقمي للنجاح.",
      seoKeywords: "تسويق رقمي, استراتيجيات, SEO, محتوى",
      readingTime: 7,
      viewCount: 1560,
      publishedAt: new Date("2025-01-08"),
    },
    {
      title: "أفضل الممارسات للتجارة الإلكترونية في 2025",
      slug: "أفضل-الممارسات-للتجارة-الإلكترونية-2025",
      excerpt: "تعرف على أفضل الممارسات والاستراتيجيات لنجاح متجرك الإلكتروني في عام 2025.",
      content: `# أفضل الممارسات للتجارة الإلكترونية\n\n## تحسين تجربة المستخدم\n\nتجربة المستخدم هي المفتاح لنجاح أي متجر إلكتروني.\n\n## السرعة والأداء\n\nموقع سريع يعني مبيعات أعلى.\n\n## التسويق الشخصي\n\nقدم تجربة تسوق شخصية لكل عميل.`,
      status: "published" as const,
      categoryId: 4,
      seoTitle: "أفضل الممارسات للتجارة الإلكترونية 2025 | KATIB",
      seoDescription: "تعرف على أفضل الممارسات لنجاح متجرك الإلكتروني.",
      seoKeywords: "تجارة إلكترونية, متجر, 2025, ممارسات",
      readingTime: 6,
      viewCount: 980,
      publishedAt: new Date("2025-01-05"),
    },
    {
      title: "كيف تبني استراتيجية محتوى ناجحة",
      slug: "كيف-تبني-استراتيجية-محتوى-ناجحة",
      excerpt: "خطوات عملية لبناء استراتيجية محتوى شاملة تحقق أهداف عملك.",
      content: `# كيف تبني استراتيجية محتوى ناجحة\n\n## حدد أهدافك\n\nما الذي تريد تحقيقه من خلال المحتوى؟\n\n## اعرف جمهورك\n\nفهم جمهورك المستهدف هو الخطوة الأولى للنجاح.\n\n## خطط المحتوى\n\nأنشئ تقويم محتوى ينظم نشر المقالات.`,
      status: "draft" as const,
      categoryId: 2,
      seoTitle: "كيف تبني استراتيجية محتوى ناجحة | KATIB",
      seoDescription: "خطوات عملية لبناء استراتيجية محتوى شاملة.",
      seoKeywords: "استراتيجية محتوى, تخطيط, محتوى ناجح",
      readingTime: 10,
      viewCount: 0,
    },
    {
      title: "أساسيات تحليل بيانات موقعك",
      slug: "أساسيات-تحليل-بيانات-الموقع",
      excerpt: "تعلم كيفية قراءة وتحليل بيانات موقعك لاتخاذ قرارات مبنية على البيانات.",
      content: `# أساسيات تحليل بيانات موقعك\n\n## Google Analytics 4\n\nالأداة الأساسية لتحليل بيانات الموقع.\n\n## المقاييس الرئيسية\n\n- عدد الزيارات\n- معدل الارتداد\n- متوسط وقت الجلسة\n\n## تحويلات الأهداف\n\nتابع تحقيق أهداف عملك.`,
      status: "published" as const,
      categoryId: 5,
      seoTitle: "أساسيات تحليل بيانات موقعك | KATIB",
      seoDescription: "تعلم كيفية قراءة وتحليل بيانات موقعك.",
      seoKeywords: "تحليل بيانات, Google Analytics, مقاييس",
      readingTime: 8,
      viewCount: 670,
      publishedAt: new Date("2025-01-03"),
    },
    {
      title: "تقنيات بناء الروابط الداخلية بذكاء",
      slug: "تقنيات-بناء-الروابط-الداخلية",
      excerpt: "تعرف على كيفية بناء شبكة روابط داخلية فعالة تحسن SEO وتسهل navigation للمستخدمين.",
      content: `# تقنيات بناء الروابط الداخلية\n\n## لماذا الروابط الداخلية مهمة؟\n\nالروابط الداخلية توزع authority وتسهل على المستخدمين التنقل.\n\n## استخدم نصوص anchor وصفية\n\nتجنب "انقر هنا" واستخدم نصوصاً وصفية.\n\n## لا تبالغ في الروابط\n\n2-5 روابط داخلية لكل مقالة كافية.`,
      status: "published" as const,
      categoryId: 1,
      seoTitle: "تقنيات بناء الروابط الداخلية | KATIB",
      seoDescription: "تعرف على كيفية بناء شبكة روابط داخلية فعالة.",
      seoKeywords: "روابط داخلية, internal links, SEO",
      readingTime: 6,
      viewCount: 1120,
      publishedAt: new Date("2024-12-28"),
    },
    {
      title: "مستقبل كتابة المحتوى مع الذكاء الاصطناعي",
      slug: "مستقبل-كتابة-المحتوى-مع-الذكاء-الاصطناعي",
      excerpt: "كيف سيغير الذكاء الاصطناعي مستقبل صناعة المحتوى وما الذي يعنيه ذلك للكتاب.",
      content: `# مستقبل كتابة المحتوى مع الذكاء الاصطناعي\n\n## التغيير الجذري\n\nالذكاء الاصطناعي يغير طريقة إنتاج المحتوى بشكل جذري.\n\n## الفرص\n\n- سرعة الإنتاج\n- تحسين الجودة\n- تخصيص المحتوى\n\n## التحديات\n\n- الحفاظ على الإبداع البشري\n- جودة المحتوى\n- الأصالة`,
      status: "published" as const,
      categoryId: 3,
      seoTitle: "مستقبل كتابة المحتوى مع AI | KATIB",
      seoDescription: "كيف سيغير الذكاء الاصطناعي مستقبل صناعة المحتوى.",
      seoKeywords: "AI, ذكاء اصطناعي, مستقبل, محتوى",
      readingTime: 7,
      viewCount: 1890,
      publishedAt: new Date("2024-12-25"),
    },
  ];

  for (const post of samplePosts) {
    await db.insert(schema.posts).values(post);
  }

  await db.insert(schema.settings).values([
    { key: "siteName", value: "KATIB" },
    { key: "siteDescription", value: "منصة إدارة محتوى ذكية" },
    { key: "siteUrl", value: "https://katib.blog" },
    { key: "postsPerPage", value: "9" },
    { key: "enableComments", value: "true" },
    { key: "defaultAuthor", value: "KATIB" },
    { key: "metaTitleTemplate", value: "%s | KATIB" },
  ]);

  await db.insert(schema.faqs).values([
    { question: "ما هي KATIB؟", answer: "KATIB هي منصة إدارة محتوى ذكية تساعدك على إنشاء وتحسين ونشر مقالات عالية الجودة.", order: 0 },
    { question: "هل KATIB مجانية؟", answer: "نعم، KATIB توفر خطة مجانية مع ميزات أساسية. هناك أيضاً خطط مدفوعة للميزات المتقدمة.", order: 1 },
    { question: "كيف يمكنني البدء؟", answer: "يمكنك البدء بإنشاء حساب مجاني ثم كتابة أول مقالة لك من خلال لوحة التحكم.", order: 2 },
    { question: "هل تدعم KATIB اللغة العربية؟", answer: "نعم، KATIB مصممة خصيصاً للمحتوى العربي مع دعم كامل للكتابة من اليمين لليسار.", order: 3 },
  ]);

  await db.insert(schema.subscribers).values([
    { email: "test@example.com", source: "website", status: "active" },
    { email: "demo@example.com", source: "landing", status: "active" },
  ]);

  console.log("Seed complete!");
  await pool.end();
}

seed().catch(console.error);
