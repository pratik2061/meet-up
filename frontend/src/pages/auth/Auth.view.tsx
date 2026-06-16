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
    <section className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="bg-primary/8 min-w-0">
        <AuthContentSection items={items} />
      </div>
      <div className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <AuthForm />
      </div>
    </section>
  );
};
