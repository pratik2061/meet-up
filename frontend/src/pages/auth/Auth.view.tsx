import { AuthContentSection } from "./components/AuthContentSection";
import { AuthForm } from "./components/AuthForm";

interface items {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}
export interface AuthviewProps {
  items: items[];
}

export const AuthView = (items: AuthviewProps) => {
  return (
    <section className="min-h-screen w-full mx-auto grid lg:grid-cols-2 grid-cols-1">
      <div className="bg-primary/8">
        <AuthContentSection items={items} />
      </div>
      <div className="min-h-screen bg-white">
        <AuthForm />
      </div>
    </section>
  );
};
