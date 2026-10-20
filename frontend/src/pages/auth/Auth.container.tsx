import { useEffect } from "react";
import { AuthView, type LoginRequestPayload } from "./Auth.view";
import { authFeatureItems } from "./constants/authItems";
import { useAuthLogin } from "@/util/api/api-hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthContainer = () => {
  const { isPending, mutate } = useAuthLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error("Google authentication failed or was cancelled.");
    }
  }, [searchParams]);

  function handleLogin(data: LoginRequestPayload) {
    mutate(data, {
      onSuccess: () => {
        navigate("/dashboard", { replace: true });
      },
    });
  }
  return (
    <AuthView
      items={authFeatureItems}
      isPending={isPending}
      loginMutate={handleLogin}
    />
  );
};
