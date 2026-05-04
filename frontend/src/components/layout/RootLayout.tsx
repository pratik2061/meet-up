import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import { Navbar } from "../ui/navbar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen  w-full">
        <AppSidebar/>
        <main className="flex-1 overflow-hidden">
          <Navbar/>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;