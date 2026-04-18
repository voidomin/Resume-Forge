import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (token) {
      // Store token
      localStorage.setItem("token", token);
      toast.success("Signed in successfully with Google!");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } else if (error) {
      toast.error(error === "google_auth_failed" ? "Google authentication failed" : "An error occurred during sign in");
      navigate("/login");
    } else {
      navigate("/login");
    }
  }, [token, error, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <h2 className="text-xl font-semibold">Completing sign in...</h2>
      <p className="text-slate-400">Please wait while we finalize your authentication.</p>
    </div>
  );
}

export default AuthCallback;
