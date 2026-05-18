import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { AuthPage } from "./pages/auth/AuthPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <AuthPage />,
    },
    {
      path: "/",
      element: <RootLayout />,
      children: [],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
