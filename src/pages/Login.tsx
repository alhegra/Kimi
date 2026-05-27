import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const handleLogin = () => {
    const authUrl = new URL(`${import.meta.env.VITE_KIMI_AUTH_URL}/api/oauth/authorize`);
    authUrl.searchParams.set("client_id", import.meta.env.VITE_APP_ID);
    authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/oauth/callback`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "profile");
    authUrl.searchParams.set("state", btoa(window.location.pathname));
    window.location.href = authUrl.toString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="text-white text-3xl font-bold tracking-tight inline-block mb-4">
            KATIB
          </Link>
          <h1 className="text-white text-2xl font-bold mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-[#a1a1a1] text-sm">
            سجل دخولك لإدارة محتواك
          </p>
        </div>

        <div className="bg-[#171717] border border-[#2a2a2a] rounded-2xl p-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#7DD3FC] text-[#0a0a0a] py-3.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            <LogIn size={18} />
            تسجيل الدخول
          </button>

          <p className="text-[#666666] text-xs text-center mt-6">
            بتسجيل الدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-[#a1a1a1] text-sm hover:text-[#7DD3FC] transition-colors">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
