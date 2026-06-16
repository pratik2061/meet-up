import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { FileChartColumn, History, Home, TvMinimal } from "lucide-react";
import { useLocation } from "react-router-dom";

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Meeting",
    href: "/meeting",
    icon: TvMinimal,
  },
  {
    name: "Report",
    href: "/report",
    icon: FileChartColumn,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

export function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar
      collapsible="icon"
      className=" text-[#1f2937] border-r border-[#e2e8e4]"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between w-full mb-4 mt-2 relative">
          <span className="bg-card text-3xl font-semibold text-primary group-data-[collapsible='icon']:hidden">
            MeetUp
          </span>
          <SidebarTrigger className="font-bold absolute -right-12 bg-primary/10 top-0 p-4" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4 mt-4 ">
              {navItems.map((item) => (
                <SidebarMenuButton
                  asChild
                  key={item.name}
                  className="py-6 data-[active=true]:text-primary data-[active=true]:font-bold"
                  isActive={location.pathname === item.href}
                >
                  <a
                    href={item.href}
                    className="flex  items-center justify-start  group-data-[collapsible=icon]:justify-center w-full px-4  group-data-[collapsible=icon]:px-0"
                  >
                    <item.icon className="size-7 min-w-7 text-primary transition-transform group-hover:scale-110" />
                    <span className="ml-4 text-xl font-normal text-inherit group-data-[collapsible=icon]:hidden whitespace-nowrap">
                      {item.name}
                    </span>
                  </a>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
