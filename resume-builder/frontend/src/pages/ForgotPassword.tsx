import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2, Key } from "lucide-react";
import toast from "react-hot-toast";
import { AuthHeroBackground } from "../components/common/AuthHeroBackground";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send reset link");
      }

      setIsSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-slate-900">
      <AuthHeroBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl mb-4">
            <Key className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mb-3 tracking-tight drop-shadow-sm">
            Reset Password
          </h1>
          <p className="text-slate-400 font-medium">
            Enter your email and we'll send you a link to get back into your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-8 border border-white/20 relative group hover:border-white/30 transition-colors duration-500">
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
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
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-500 font-medium text-white shadow-inner"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-white/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm p-4 rounded-xl font-medium mb-6">
                If an account exists for {email}, a reset link has been sent. Please check your inbox and spam folder.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-slate-300 hover:text-white font-semibold transition-colors"
              >
                <span>Back to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Footer */}
          {!isSent && (
            <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
              <p className="text-slate-400 font-medium">
                Remember your password?{" "}
                <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
