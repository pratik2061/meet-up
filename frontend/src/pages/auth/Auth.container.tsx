import { useEffect } from "react";
import { AuthView, type LoginRequestPayload } from "./Auth.view";
import { authFeatureItems } from "./constants/authItems";
import { useAuthLogin } from "@/util/api/api-hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCurrentUser } from "@/util/api/api-hooks/use-current-user";
import { queryClient } from "@/App";
import { currentUser } from "./services/currentUser";

export const AuthContainer = () => {
  const { isPending, mutateAsync } = useAuthLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: userData } = useCurrentUser();

  useEffect(() => {
    if (userData?.data) {
      navigate("/dashboard", { replace: true });
    }
  }, [userData, navigate]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error("Google authentication failed or was cancelled.");
    }
  }, [searchParams]);

  async function handleLogin(data: LoginRequestPayload) {
    try {
      await mutateAsync(data);
      // Pre-fetch the user details into React Query cache so ProtectedRoute won't bounce back to login
      await queryClient.fetchQuery({
        queryKey: ["current-user"],
        queryFn: currentUser,
      });
      navigate("/dashboard", { replace: true });
    } catch {
      // Error is already handled by useAuthLogin onError toast
    }
  }
  return (
    <AuthView
      items={authFeatureItems}
      isPending={isPending}
      loginMutate={handleLogin}
    />
  );
};
