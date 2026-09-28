import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "./api/api-hooks/use-current-user";
import { Spinner } from "@/components/ui/spinner";

export const ProtectedRoute = () => {
  const location = useLocation();

  const { data: userData, error, isError, isPending } = useCurrentUser();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex justify-center items-center lg:text-2xl md:text-xl text-lg">
          <Spinner className="size-7" />{" "}
          <span className="text-primary px-2 md:block hidden">checking authentication...</span>
        </div>
      </div>
    );
  }
  if (isError || !userData?.data) {
    console.error("Error fetching user data:", error);
    return (
      <Navigate to={"/login"} state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
};
