import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[#7DD3FC] text-8xl font-bold font-mono mb-4">404</h1>
        <h2 className="text-white text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
        <p className="text-[#a1a1a1] mb-8">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#7DD3FC] text-[#0a0a0a] px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
