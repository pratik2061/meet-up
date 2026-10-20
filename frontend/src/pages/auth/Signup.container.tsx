import { useNavigate } from "react-router-dom";
import { SignupView } from "./Signup.view";
import { authFeatureItems } from "./constants/authItems";
import { useAuthRegister } from "@/util/api/api-hooks/use-auth";
import type { RegisterRequestPayload } from "./services/register";

export const SignupContainer = () => {
  const { isPending, mutate } = useAuthRegister();
  const navigate = useNavigate();

  function handleSignup(data: RegisterRequestPayload) {
    mutate(data, {
      onSuccess: () => {
        navigate("/login", { replace: true });
      },
    });
  }

  return (
    <SignupView
      items={authFeatureItems}
      isPending={isPending}
      signupMutate={handleSignup}
    />
  );
};
