import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import { Navbar } from "../ui/navbar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <main className="flex min-w-0 flex-1 flex-col min-h-0">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;
