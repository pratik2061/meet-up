import { LogOut, User } from "lucide-react";
import { Notification } from "./notification";
import { Profile } from "./profile";

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
    <div className="w-full mx-auto border-b shadow-xs">
      <div className="flex w-full items-center justify-end  p-2 ">
        <Notification />

        {/* dropdown menu for profile and logout and other persoal settings */}
        <Profile data={NavItem} />
      </div>
    </div>
  );
};

export { Navbar };
