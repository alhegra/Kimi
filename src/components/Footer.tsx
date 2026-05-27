import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="text-white text-lg font-bold tracking-tight">
          KATIB
        </Link>
        <div className="flex items-center gap-6 text-[#666666] text-xs">
          <Link to="/blog" className="hover:text-[#a1a1a1] transition-colors">
            المدونة
          </Link>
          <Link to="/login" className="hover:text-[#a1a1a1] transition-colors">
            تسجيل الدخول
          </Link>
          <span>© 2025 KATIB. جميع الحقوق محفوظة.</span>
        </div>
      </div>
    </footer>
  );
}
