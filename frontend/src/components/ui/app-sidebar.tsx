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
import { FileChartColumn, Home, TvMinimal, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useGetFriendRequests } from "@/util/api/api-hooks/use-friends";

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
    name: "Friends",
    href: "/friends",
    icon: Users,
  },
  {
    name: "Report",
    href: "/report",
    icon: FileChartColumn,
  },
  // {
  //   name: "History",
  //   href: "/history",
  //   icon: History,
  // },
];

export function AppSidebar() {
  const location = useLocation();
  const { data: requestsData } = useGetFriendRequests();
  const incomingCount = requestsData?.incomingCount || 0;

  return (
    <Sidebar
      collapsible="icon"
      className=" text-[#1f2937] border-r border-[#e2e8e4]"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between w-full mb-4 mt-2 ">
          <span className="bg-card text-3xl font-semibold text-primary group-data-[collapsible='icon']:hidden">
            MeetUp
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4 mt-4 ">
              {navItems.map((item) => {
                const showBadge = item.href === "/friends" && incomingCount > 0;

                return (
                  <SidebarMenuButton
                    asChild
                    key={item.name}
                    className="py-6 data-[active=true]:text-primary data-[active=true]:font-bold"
                    isActive={location.pathname === item.href}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center justify-start group-data-[collapsible=icon]:justify-center w-full px-4 group-data-[collapsible=icon]:px-0 relative"
                    >
                      <div className="relative">
                        <item.icon className="size-7 min-w-7 text-primary transition-transform group-hover:scale-110" />
                        {showBadge && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full group-data-[collapsible=icon]:block hidden" />
                        )}
                      </div>
                      <span className="ml-4 text-xl font-normal text-inherit group-data-[collapsible=icon]:hidden whitespace-nowrap flex items-center gap-2">
                        {item.name}
                        {showBadge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                            {incomingCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex justify-end px-4 py-2">
        <SidebarTrigger className="font-bold   bg-primary/10 " />
      </div>
    </Sidebar>
  );
}
