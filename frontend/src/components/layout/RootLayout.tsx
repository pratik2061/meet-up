import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import { Navbar } from "../ui/navbar";
import { useFriendSocket } from "@/util/hooks/use-friend-socket";

const RootLayout = () => {
  useFriendSocket();

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden">
        <AppSidebar />

        <main className="flex min-w-0 flex-1 flex-col min-h-0">
          <Navbar />

          <div className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;
