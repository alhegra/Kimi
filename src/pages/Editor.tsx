import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import SEOMeta from "@/components/SEOMeta";
import { generateSlug } from "@/lib/seo";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image,
  Link,
  Code,
  Save,
  ArrowRight,
  Sparkles,
  Eye,
  Settings,
  ChevronDown,
  X,
  Check,
  Loader2,
  Wand2,
  KeyRound,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Tags,
  BarChart3,
} from "lucide-react";

type Toast = { message: string; type: "success" | "error" | "warning" | "info" };

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const postId = id ? parseInt(id) : 0;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"settings" | "seo" | "ai">("settings");
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const utils = trpc.useUtils();
  const { data: existingPost } = trpc.posts.getById.useQuery(
    { id: postId },
    { enabled: isEdit }
  );
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allTags } = trpc.tags.list.useQuery();
  const { data: postTags } = trpc.posts.getTags.useQuery(
    { postId },
    { enabled: isEdit && postId > 0 }
  );

  // AI helpers
  const generateExcerpt = trpc.ai.generateExcerpt.useQuery(
    { content },
    { enabled: false }
  );
  const generateKeywords = trpc.ai.generateKeywords.useQuery(
    { content, count: 10 },
    { enabled: false }
  );
  const generateSEOTitle = trpc.ai.generateSEOTitle.useQuery(
    { title },
    { enabled: false }
  );
  const generateSEODescription = trpc.ai.generateSEODescription.useQuery(
    { content },
    { enabled: false }
  );
  const generateTags = trpc.ai.generateTags.useQuery(
    { content, count: 5 },
    { enabled: false }
  );
  const generateFAQs = trpc.ai.generateFAQs.useQuery(
    { content },
    { enabled: false }
  );
  const seoScore = trpc.ai.suggestSEO.useQuery(
    { title, content, seoTitle, seoDescription },
    { enabled: false }
  );

  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.stats.invalidate();
      setSaving(false);
      setToast({ message: "تم نشر المقال بنجاح!", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    },
    onError: (err) => {
      setSaving(false);
      setToast({ message: err.message, type: "error" });
    },
  });

  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.stats.invalidate();
      setSaving(false);
      setToast({ message: "تم تحديث المقال بنجاح!", type: "success" });
    },
    onError: (err) => {
      setSaving(false);
      setToast({ message: err.message, type: "error" });
    },
  });

  const saveFAQs = trpc.faqs.create.useMutation({
    onSuccess: () => {
      utils.faqs.list.invalidate();
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setContent(existingPost.content || "");
      setExcerpt(existingPost.excerpt || "");
      setFeaturedImage(existingPost.featuredImage || "");
      setStatus(existingPost.status as "draft" | "published" | "scheduled");
      setCategoryId(existingPost.categoryId ?? undefined);
      setSeoTitle(existingPost.seoTitle || "");
      setSeoDescription(existingPost.seoDescription || "");
      setSeoKeywords(existingPost.seoKeywords || "");
    }
  }, [existingPost]);

  useEffect(() => {
    if (postTags && postTags.length > 0) {
      setSelectedTags(postTags.map((t) => t.id));
    }
  }, [postTags]);

  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ message: "عنوان المقال مطلوب", type: "warning" });
      return;
    }
    setSaving(true);
    const slug = generateSlug(title);

    if (isEdit) {
      updatePost.mutate({
        id: postId,
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status,
        categoryId,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        tagIds: selectedTags,
      });
    } else {
      createPost.mutate({
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status,
        categoryId,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        tagIds: selectedTags,
      });
    }
  };

  const runAI = async (type: string) => {
    setAiLoading(type);
    try {
      switch (type) {
        case "excerpt":
          await generateExcerpt.refetch();
          if (generateExcerpt.data) setExcerpt(generateExcerpt.data);
          break;
        case "keywords":
          await generateKeywords.refetch();
          if (generateKeywords.data) setSeoKeywords(generateKeywords.data.join(", "));
          break;
        case "seoTitle":
          await generateSEOTitle.refetch();
          if (generateSEOTitle.data) setSeoTitle(generateSEOTitle.data);
          break;
        case "seoDescription":
          await generateSEODescription.refetch();
          if (generateSEODescription.data) setSeoDescription(generateSEODescription.data);
          break;
        case "tags":
          await generateTags.refetch();
          if (generateTags.data && allTags) {
            const tagIds = generateTags.data
              .map((gt) => allTags.find((t) => t.slug === gt.slug)?.id)
              .filter((id): id is number => id !== undefined);
            setSelectedTags(tagIds);
          }
          break;
        case "faqs":
          await generateFAQs.refetch();
          if (generateFAQs.data && postId) {
            for (const faq of generateFAQs.data) {
              await saveFAQs.mutateAsync({ postId, ...faq });
            }
            setToast({ message: "تم توليد و حفظ FAQs بنجاح!", type: "success" });
          } else if (generateFAQs.data && !isEdit) {
            setToast({ message: "احفظ المقال أولاً لتوليد FAQs", type: "info" });
          }
          break;
        case "score":
          await seoScore.refetch();
          break;
      }
    } catch {
      // ignore
    }
    setAiLoading(null);
  };

  const insertFormat = (before: string, after: string = "") => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  if (!user) return null;

  return (
    <>
      <SEOMeta title={isEdit ? "تعديل مقال" : "مقال جديد"} robots="noindex,nofollow" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fade-in-up flex items-center gap-2 ${
          toast.type === "success" ? "bg-[rgba(45,212,191,0.15)] text-[#2DD4BF] border border-[#2DD4BF]/30" :
          toast.type === "error" ? "bg-[rgba(251,113,133,0.15)] text-[#FB7185] border border-[#FB7185]/30" :
          toast.type === "warning" ? "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[#f59e0b]/30" :
          "bg-[rgba(125,211,252,0.15)] text-[#7DD3FC] border border-[#7DD3FC]/30"
        }`}>
          {toast.type === "success" && <CheckCircle size={16} />}
          {toast.type === "error" && <AlertTriangle size={16} />}
          {toast.type === "warning" && <AlertTriangle size={16} />}
          {toast.type === "info" && <Info size={16} />}
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-[#171717] border-b border-[#2a2a2a] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[#a1a1a1] hover:text-white transition-colors"
            >
              <ArrowRight size={20} />
            </button>
            <span className="text-white font-semibold text-sm">
              {isEdit ? "تعديل مقال" : "مقال جديد"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-[#a1a1a1] hover:text-white text-sm transition-colors"
            >
              <Eye size={16} />
              معاينة
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#7DD3FC] text-[#0a0a0a] px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-11 bg-[#171717] border-b border-[#2a2a2a] flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
          {[
            { icon: Bold, action: () => insertFormat("**", "**"), label: "عريض" },
            { icon: Italic, action: () => insertFormat("*", "*"), label: "مائل" },
            { icon: List, action: () => insertFormat("\n- ", ""), label: "قائمة" },
            { icon: ListOrdered, action: () => insertFormat("\n1. ", ""), label: "مرقم" },
            { icon: Image, action: () => insertFormat("\n![alt](", ")\n"), label: "صورة" },
            { icon: Link, action: () => insertFormat("[", "](url)"), label: "رابط" },
            { icon: Code, action: () => insertFormat("`", "`"), label: "كود" },
          ].map((tool) => (
            <button
              key={tool.label}
              onClick={tool.action}
              className="p-1.5 text-[#878787] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded transition-all"
              title={tool.label}
            >
              <tool.icon size={16} />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Title Input */}
            <input
              type="text"
              placeholder="عنوان المقال..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 bg-transparent text-white text-xl font-bold placeholder-[#666666] border-none outline-none"
            />

            {/* Content Editor */}
            {showPreview ? (
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  {title && <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>}
                  {excerpt && <p className="text-[#a1a1a1] mb-6">{excerpt}</p>}
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{
                      __html: content
                        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
                        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/^- (.*$)/gim, "<li>$1</li>")
                        .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
                        .replace(/\n/g, "<br />")
                        .replace(/<br \/>(<h[12])/g, "$1")
                        .replace(/<\/h([12])><br \/>/g, "</h$1>")
                        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="rounded-lg my-4 max-w-full" />')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#7DD3FC] hover:underline">$1</a>')
                    }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                id="editor"
                placeholder="ابدأ في كتابة مقالك..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full px-6 py-4 bg-transparent text-white text-base leading-relaxed placeholder-[#666666] border-none outline-none resize-none font-[inherit]"
                style={{ direction: "rtl" }}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-80 bg-[#171717] border-r border-[#2a2a2a] overflow-y-auto shrink-0 hidden lg:block">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-[#2a2a2a]">
              {[
                { id: "settings" as const, icon: Settings, label: "إعدادات" },
                { id: "seo" as const, icon: KeyRound, label: "SEO" },
                { id: "ai" as const, icon: Sparkles, label: "ذكاء" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                    sidebarTab === tab.id
                      ? "text-[#7DD3FC] border-b-2 border-[#7DD3FC]"
                      : "text-[#666666] hover:text-[#a1a1a1]"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4">
              {/* Settings Tab */}
              {sidebarTab === "settings" && (
                <>
                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      الملخص
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="ملخص المقال..."
                      rows={3}
                      className="input-field w-full py-3 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      صورة مميزة
                    </label>
                    <input
                      type="text"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="رابط الصورة..."
                      className="input-field w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      التصنيف
                    </label>
                    <select
                      value={categoryId || ""}
                      onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input-field w-full text-sm"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      الوسوم
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags?.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((id) => id !== tag.id)
                                : [...prev, tag.id]
                            );
                          }}
                          className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                            selectedTags.includes(tag.id)
                              ? "bg-[rgba(125,211,252,0.15)] text-[#7DD3FC] border border-[#7DD3FC]/30"
                              : "bg-[#0a0a0a] text-[#666666] border border-[#2a2a2a] hover:text-[#a1a1a1]"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      الحالة
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "draft" | "published" | "scheduled")}
                      className="input-field w-full text-sm"
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="scheduled">مجدول</option>
                    </select>
                  </div>
                </>
              )}

              {/* SEO Tab */}
              {sidebarTab === "seo" && (
                <>
                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      عنوان SEO
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="عنوان SEO..."
                      className="input-field w-full text-sm"
                    />
                    <p className="text-[#666666] text-[10px] mt-1">
                      {seoTitle.length}/60 حرف
                    </p>
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      وصف SEO
                    </label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="وصف SEO..."
                      rows={3}
                      className="input-field w-full py-3 resize-none"
                    />
                    <p className="text-[#666666] text-[10px] mt-1">
                      {seoDescription.length}/160 حرف
                    </p>
                  </div>

                  <div>
                    <label className="block text-[#a1a1a1] text-xs mb-1.5">
                      الكلمات المفتاحية
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="مفصولة بفواصل..."
                      className="input-field w-full text-sm"
                    />
                  </div>

                  {/* SEO Score */}
                  {seoScore.data && (
                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white text-sm font-medium">درجة SEO</span>
                        <span className={`text-lg font-bold font-mono ${
                          seoScore.data.grade === "A" ? "text-[#2DD4BF]" :
                          seoScore.data.grade === "B" ? "text-[#7DD3FC]" :
                          seoScore.data.grade === "C" ? "text-[#f59e0b]" : "text-[#FB7185]"
                        }`}>
                          {seoScore.data.grade}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#2a2a2a] rounded-full mb-3">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(seoScore.data.score / seoScore.data.maxScore) * 100}%`,
                            backgroundColor:
                              seoScore.data.grade === "A" ? "#2DD4BF" :
                              seoScore.data.grade === "B" ? "#7DD3FC" :
                              seoScore.data.grade === "C" ? "#f59e0b" : "#FB7185",
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        {seoScore.data.suggestions.map((s: { type: string; message: string }, i: number) => (
                          <div key={i} className={`flex items-start gap-1.5 text-xs ${
                            s.type === "error" ? "text-[#FB7185]" :
                            s.type === "warning" ? "text-[#f59e0b]" : "text-[#a1a1a1]"
                          }`}>
                            {s.type === "error" && <AlertTriangle size={12} className="shrink-0 mt-0.5" />}
                            {s.type === "warning" && <Info size={12} className="shrink-0 mt-0.5" />}
                            {s.type !== "error" && s.type !== "warning" && <CheckCircle size={12} className="shrink-0 mt-0.5" />}
                            {s.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* AI Tab */}
              {sidebarTab === "ai" && (
                <div className="space-y-3">
                  {[
                    { id: "excerpt", label: "توليد الملخص", icon: Sparkles },
                    { id: "keywords", label: "توليد الكلمات المفتاحية", icon: KeyRound },
                    { id: "seoTitle", label: "توليد عنوان SEO", icon: Wand2 },
                    { id: "seoDescription", label: "توليد وصف SEO", icon: Wand2 },
                    { id: "tags", label: "اقتراح الوسوم", icon: Tags },
                    { id: "faqs", label: "توليد FAQs", icon: HelpCircle },
                    { id: "score", label: "تحليل SEO", icon: BarChart3 },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => runAI(tool.id)}
                      disabled={aiLoading === tool.id}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-[#a1a1a1] hover:text-white hover:border-[rgba(125,211,252,0.3)] transition-all text-sm disabled:opacity-50"
                    >
                      {aiLoading === tool.id ? (
                        <Loader2 size={16} className="animate-spin text-[#7DD3FC]" />
                      ) : (
                        <tool.icon size={16} />
                      )}
                      {tool.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
