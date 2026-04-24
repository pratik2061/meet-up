import { Outlet } from "react-router-dom";
import { Sidebar } from "../ui/sidebar";
import { SidebarProvider } from "../ui/sidebar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen  w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;