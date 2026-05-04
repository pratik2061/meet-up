import { LogOut, User } from "lucide-react";

export const Navbar = () => {
  const NavItem = [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ];
  return (
    <div className="w-full mx-auto">
      <div className="flex w-full items-center justify-end gap-4 p-4">
        {NavItem.map((item) => (
          <a href={item.href} key={item.name}>
            <item.icon className="size-6" />
          </a>
        ))}
      </div>
    </div>
  );
};
