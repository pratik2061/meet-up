import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { NotFound } from "./components/not-found";
import { AuthContainer } from "./pages/auth/Auth.container";
import { SignupContainer } from "./pages/auth/Signup.container";
import { DashboardContainer } from "./pages/dashboard/Dashboard.container";
import MeetingContainer from "./pages/meeting/Meeting.container";
import Reportcontainer from "./pages/report/Report.container";
import ProfileContainer from "./pages/profile/Profile.container";
import MeetingMainPage from "./components/webrtc/components/MeetingMainPage";
import { ProtectedRoute } from "./util/protectedRoutes";
import ResetPasswordPage from "./pages/auth/ResetPassword.page";
import GoogleCallbackPage from "./pages/auth/GoogleCallback.page";
import { FriendsContainer } from "./pages/friends/Friends.container";
// import Historycontainer from "./pages/history/History.container";

export const queryClient = new QueryClient();
function App() {
  const router = createBrowserRouter([
    {
      path: "/*",
      element: <NotFound />,
    },
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <AuthContainer />,
    },
    {
      path: "/signup",
      element: <SignupContainer />,
    },
    {
      path: "/reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "/auth/callback",
      element: <GoogleCallbackPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <RootLayout />,
          children: [
            {
              path: "/dashboard",
              element: <DashboardContainer />,
            },
            {
              path: "/meeting",
              element: <MeetingContainer />,
            },
            {
              path: "/meeting/new",
              element: <MeetingMainPage />,
            },
            {
              path: "/meeting/:roomId",
              element: <MeetingMainPage />,
            },
            {
              path: "/friends",
              element: <FriendsContainer />,
            },
            {
              path: "/report",
              element: <Reportcontainer />,
            },
            {
              path: "/profile",
              element: <ProfileContainer />,
            },
            // {
            //   path: "/history",
            //   element: <Historycontainer />,
            // },
          ],
        },
      ],
    },
  ]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  );
}

export default App;
