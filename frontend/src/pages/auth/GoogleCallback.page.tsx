import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "@/util/api/axiosInstance";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasExchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?error=missing_code", { replace: true });
      return;
    }

    // Prevent double-execution in StrictMode
    if (hasExchanged.current) return;
    hasExchanged.current = true;

    axiosInstance
      .post("/auth/google/exchange", { code })
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=google_auth_failed", { replace: true });
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        <p className="text-lg text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
