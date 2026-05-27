import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-[rgba(10,10,10,0.9)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-white text-xl font-bold tracking-tight">
          KATIB
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-[#a1a1a1] hover:text-white text-sm font-medium transition-colors"
          >
            الرئيسية
          </Link>
          <Link
            to="/blog"
            className="text-[#a1a1a1] hover:text-white text-sm font-medium transition-colors"
          >
            المدونة
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-[#7DD3FC] text-[#0a0a0a] px-6 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
            >
              لوحة التحكم
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-[#7DD3FC] text-[#0a0a0a] px-6 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
            >
              تسجيل الدخول
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-[#171717] border-b border-[#2a2a2a] md:hidden animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-[#a1a1a1] hover:text-white text-sm font-medium py-2"
            >
              الرئيسية
            </Link>
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="text-[#a1a1a1] hover:text-white text-sm font-medium py-2"
            >
              المدونة
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="bg-[#7DD3FC] text-[#0a0a0a] px-6 py-2.5 rounded-lg text-sm font-semibold text-center"
              >
                لوحة التحكم
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-[#7DD3FC] text-[#0a0a0a] px-6 py-2.5 rounded-lg text-sm font-semibold text-center"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
