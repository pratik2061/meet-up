import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { AuthContainer } from "./pages/auth/Auth.container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { NotFound } from "./components/not-found";
import { DashboardContainer } from "./pages/dashboard/Dashboard.container";
import MeetingContainer from "./pages/meeting/Meeting.container";
import Reportcontainer from "./pages/report/Report.container";
import MeetingPreview from "./components/MeetingPreview";
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
          element: <MeetingPreview />,
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
