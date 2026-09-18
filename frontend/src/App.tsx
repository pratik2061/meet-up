import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { NotFound } from "./components/not-found";
import { AuthContainer } from "./pages/auth/Auth.container";
import { DashboardContainer } from "./pages/dashboard/Dashboard.container";
import MeetingContainer from "./pages/meeting/Meeting.container";
import Reportcontainer from "./pages/report/Report.container";
import MeetingMainPage from "./components/webrtc/components/MeetingMainPage";
// import Historycontainer from "./pages/history/History.container";

function App() {
  const queryClient = new QueryClient();
  const router = createBrowserRouter([
    {
      path: "/*",
      element: <NotFound />,
    },
    {
      path: "/login",
      element: <AuthContainer />,
    },
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
          path: "/report",
          element: <Reportcontainer />,
        },
        // {
        //   path: "/history",
        //   element: <Historycontainer />,
        // },
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
