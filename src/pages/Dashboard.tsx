import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import SEOMeta from "@/components/SEOMeta";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Table2,
  FolderOpen,
  Tag,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Mail,
  TrendingUp,
} from "lucide-react";

const navGroups = [
  {
    label: "المحتوى",
    items: [
      { icon: FileText, label: "المقالات", id: "articles" },
      { icon: BarChart3, label: "الإحصائيات", id: "stats" },
      { icon: Table2, label: "جدول المقالات", id: "table" },
    ],
  },
  {
    label: "التنظيم",
    items: [
      { icon: FolderOpen, label: "التصنيفات", id: "categories" },
      { icon: Tag, label: "الوسوم", id: "tags" },
    ],
  },
  {
    label: "النظام",
    items: [
      { icon: Users, label: "المشتركون", id: "subscribers" },
      { icon: Settings, label: "الإعدادات", id: "settings" },
    ],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const { data: stats } = trpc.posts.stats.useQuery(undefined, { enabled: !!user });
  const { data: postsData, isLoading: postsLoading } = trpc.posts.list.useQuery(
    {
      page: 1,
      limit: 50,
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    },
    { enabled: !!user && (activeTab === "articles" || activeTab === "table") }
  );
  const { data: categories } = trpc.categories.list.useQuery(undefined, { enabled: !!user });
  const { data: tagsData } = trpc.tags.list.useQuery(undefined, { enabled: !!user });
  const { data: subscribersData } = trpc.subscribers.list.useQuery(
    { page: 1, limit: 50 },
    { enabled: !!user && activeTab === "subscribers" }
  );
  const { data: settingsData } = trpc.settings.getAll.useQuery(undefined, { enabled: !!user && activeTab === "settings" });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.stats.invalidate();
      setDeleteConfirm(null);
      setToast({ message: "تم حذف المقال بنجاح", type: "success" });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#7DD3FC] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(45,212,191,0.1)] text-[#2DD4BF] text-xs font-medium rounded-full">
            <CheckCircle size={12} />
            منشور
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b] text-xs font-medium rounded-full">
            <AlertTriangle size={12} />
            مسودة
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(253,164,175,0.1)] text-[#FDA4AF] text-xs font-medium rounded-full">
            <TrendingUp size={12} />
            مجدول
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(251,113,133,0.1)] text-[#FB7185] text-xs font-medium rounded-full">
            <XCircle size={12} />
            محذوف
          </span>
        );
    }
  };

  return (
    <>
      <SEOMeta title="لوحة التحكم - KATIB" robots="noindex,nofollow" />
      <div className="min-h-screen bg-[#0a0a0a] flex">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 left-4 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fade-in-up ${
            toast.type === "success" ? "bg-[rgba(45,212,191,0.15)] text-[#2DD4BF] border border-[#2DD4BF]/30" : "bg-[rgba(251,113,133,0.15)] text-[#FB7185] border border-[#FB7185]/30"
          }`}>
            {toast.message}
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 bg-[#171717] border-l border-[#2a2a2a] transition-all duration-300 ${
            sidebarOpen ? "w-64 translate-x-0" : "w-0 translate-x-full overflow-hidden"
          } lg:relative lg:translate-x-0`}
        >
          <div className="p-6">
            <Link to="/" className="text-white text-xl font-bold tracking-tight block mb-8">
              KATIB
            </Link>

            <nav className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-medium text-[#666666] uppercase tracking-wider mb-2 px-3">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`nav-item w-full ${activeTab === item.id ? "active" : ""}`}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#2a2a2a]">
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="nav-item w-full text-[#FB7185] hover:text-[#FB7185] hover:bg-[rgba(251,113,133,0.1)]"
                >
                  <LogOut size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <header className="h-16 border-b border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-[#a1a1a1] hover:text-white p-2"
              >
                <LayoutDashboard size={20} />
              </button>
              <h1 className="text-white font-semibold">
                {activeTab === "articles" && "المقالات"}
                {activeTab === "stats" && "الإحصائيات"}
                {activeTab === "table" && "جدول المقالات"}
                {activeTab === "categories" && "التصنيفات"}
                {activeTab === "tags" && "الوسوم"}
                {activeTab === "subscribers" && "المشتركون"}
                {activeTab === "settings" && "الإعدادات"}
              </h1>
            </div>
            <Link
              to="/dashboard/editor"
              className="flex items-center gap-2 bg-[#7DD3FC] text-[#0a0a0a] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
            >
              <Plus size={16} />
              مقال جديد
            </Link>
          </header>

          <div className="p-6">
            {/* Stats Cards */}
            {(activeTab === "stats" || activeTab === "articles" || activeTab === "table") && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "إجمالي المقالات", value: stats?.totalPosts ?? 0, color: "#7DD3FC" },
                  { label: "المقالات المنشورة", value: stats?.publishedPosts ?? 0, color: "#2DD4BF" },
                  { label: "إجمالي المشاهدات", value: stats?.totalViews ?? 0, color: "#A78BFA" },
                  { label: "التصنيفات", value: categories?.length ?? 0, color: "#FDA4AF" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="glass-card p-5"
                  >
                    <p className="text-[#666666] text-xs font-medium mb-2">
                      {stat.label}
                    </p>
                    <p
                      className="text-3xl font-bold font-mono"
                      style={{ color: stat.color }}
                    >
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString("ar-SA")
                        : stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Articles Table */}
            {activeTab === "table" && (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                      type="text"
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field w-full pr-10 text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    <option value="">كل الحالات</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="scheduled">مجدول</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[#2a2a2a]">
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider">
                            المقال
                          </th>
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider hidden md:table-cell">
                            التصنيف
                          </th>
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                            المشاهدات
                          </th>
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider hidden lg:table-cell">
                            النشر
                          </th>
                          <th className="px-4 py-3 text-[#666666] text-xs font-medium uppercase tracking-wider">
                            إجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {postsLoading ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-[#2a2a2a]">
                              <td colSpan={6} className="px-4 py-4">
                                <div className="h-10 bg-[#0a0a0a] rounded animate-pulse" />
                              </td>
                            </tr>
                          ))
                        ) : postsData?.posts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-[#666666]">
                              لا توجد مقالات
                            </td>
                          </tr>
                        ) : (
                          postsData?.posts.map((post) => (
                            <tr
                              key={post.id}
                              className="border-b border-[#2a2a2a] hover:bg-[#1e1e1e] transition-colors group"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f] rounded-lg flex items-center justify-center text-[#2a2a2a] text-sm font-bold shrink-0">
                                    {post.title.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <Link
                                      to={`/article/${post.slug}`}
                                      className="text-white text-sm font-medium truncate block hover:text-[#7DD3FC] transition-colors"
                                    >
                                      {post.title}
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <span className="text-[#a1a1a1] text-xs">
                                  {post.categoryName || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3">{statusBadge(post.status)}</td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className="text-white text-sm font-mono">
                                  {(post.viewCount ?? 0).toLocaleString("ar-SA")}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <span className="text-[#666666] text-xs">
                                  {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString("ar-SA")
                                    : "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Link
                                    to={`/article/${post.slug}`}
                                    className="p-1.5 text-[#666666] hover:text-[#7DD3FC] transition-colors rounded-lg hover:bg-[rgba(125,211,252,0.1)]"
                                    title="عرض"
                                  >
                                    <Eye size={15} />
                                  </Link>
                                  <Link
                                    to={`/dashboard/editor/${post.id}`}
                                    className="p-1.5 text-[#666666] hover:text-[#7DD3FC] transition-colors rounded-lg hover:bg-[rgba(125,211,252,0.1)]"
                                    title="تعديل"
                                  >
                                    <Edit3 size={15} />
                                  </Link>
                                  <button
                                    onClick={() => setDeleteConfirm(post.id)}
                                    className="p-1.5 text-[#666666] hover:text-[#FB7185] transition-colors rounded-lg hover:bg-[rgba(251,113,133,0.1)]"
                                    title="حذف"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">التصنيفات</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-5 card-hover"
                    >
                      <h3 className="text-white font-semibold mb-1">{cat.name}</h3>
                      <p className="text-[#666666] text-sm mb-3">{cat.description}</p>
                      <Link
                        to={`/category/${cat.slug}`}
                        className="text-[#7DD3FC] text-xs hover:underline"
                      >
                        عرض المقالات ←
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Tab */}
            {activeTab === "tags" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tagsData?.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tag/${tag.slug}`}
                      className="px-4 py-2 bg-[#171717] border border-[#2a2a2a] rounded-full text-[#a1a1a1] text-sm hover:text-[#7DD3FC] hover:border-[#7DD3FC]/30 transition-all"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribers Tab */}
            {activeTab === "subscribers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">
                    المشتركون ({subscribersData?.total ?? 0})
                  </h2>
                </div>
                <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[#2a2a2a]">
                        <th className="px-4 py-3 text-[#666666] text-xs font-medium">البريد</th>
                        <th className="px-4 py-3 text-[#666666] text-xs font-medium">المصدر</th>
                        <th className="px-4 py-3 text-[#666666] text-xs font-medium">الحالة</th>
                        <th className="px-4 py-3 text-[#666666] text-xs font-medium">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribersData?.subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-[#2a2a2a] hover:bg-[#1e1e1e]">
                          <td className="px-4 py-3 text-white text-sm">{sub.email}</td>
                          <td className="px-4 py-3 text-[#a1a1a1] text-xs">{sub.source}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs ${sub.status === "active" ? "text-[#2DD4BF]" : "text-[#FB7185]"}`}>
                              {sub.status === "active" ? "نشط" : "غير نشط"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#666666] text-xs">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("ar-SA") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <div className="space-y-6">
                  {settingsData && Object.entries(settingsData).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-[#171717] border border-[#2a2a2a] rounded-xl">
                      <span className="text-white text-sm font-medium">{key}</span>
                      <span className="text-[#a1a1a1] text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
            <h3 className="text-white font-semibold mb-2">تأكيد الحذف</h3>
            <p className="text-[#a1a1a1] text-sm mb-6">
              هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={() => deletePost.mutate({ id: deleteConfirm })}
                className="flex-1 bg-[#FB7185] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
