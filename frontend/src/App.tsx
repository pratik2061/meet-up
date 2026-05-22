import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { AuthContainer } from "./pages/auth/Auth.container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

function App() {
  const queryClient = new QueryClient();
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <AuthContainer />,
    },
    {
      path: "/",
      element: <RootLayout />,
      children: [],
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
