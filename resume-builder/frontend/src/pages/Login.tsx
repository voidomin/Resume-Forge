import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthHeroBackground } from "../components/common/AuthHeroBackground";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-slate-900">
      <AuthHeroBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mb-3 tracking-tight drop-shadow-sm">
            Welcome Back
          </h1>
          <p className="text-slate-400 font-medium">
            Sign in to continue building amazing resumes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-8 border border-white/20 relative group hover:border-white/30 transition-colors duration-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-500 font-medium text-white shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-500 font-medium text-white shadow-inner"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-white/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
            <p className="text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-400 font-bold hover:text-blue-300 transition-colors drop-shadow"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
