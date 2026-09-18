import { LogOut, User } from "lucide-react";
import { Notification } from "./notification";
import { Profile } from "./profile";
import { SidebarTrigger } from "./sidebar";

const Navbar = () => {
  const NavItem = [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      color: "",
    },
    {
      name: "Logout",
      href: "/logout",
      icon: LogOut,
      color: "text-red-500 hover:text-red-400",
    },
  ];
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background shadow-xs">
      <div className="flex w-full items-center justify-between md:justify-end p-2">
        <SidebarTrigger className="md:hidden" />

        <div className="flex items-center ">
          <Notification />
          <Profile data={NavItem} />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
