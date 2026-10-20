import { AuthContentSection } from "./components/AuthContentSection";
import { SignupForm } from "./components/SignupForm";
import type { items } from "./Auth.view";
import type { RegisterRequestPayload } from "./services/register";

export interface SignupViewProps {
  items: items[];
  isPending: boolean;
  signupMutate: (data: RegisterRequestPayload) => void;
}

export const SignupView = ({
  items,
  isPending,
  signupMutate,
}: SignupViewProps) => {
  return (
    <section className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="bg-primary/8 min-w-0">
        <AuthContentSection items={items} />
      </div>
      <div className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <SignupForm isPending={isPending} signupMutate={signupMutate} />
      </div>
    </section>
  );
};
