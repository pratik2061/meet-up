import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Badge } from "./badge";
import { Spinner } from "./spinner";
import { useCurrentUser } from "@/util/api/api-hooks/use-current-user";
import DefaultProfileImage from "@/assets/default_profile.webp";

interface ProfileProps {
  name: string;
  href?: string;
  icon: React.ElementType;
  color: string | "";
  function?: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

export const Profile = ({ data }: { data: ProfileProps[] }) => {
  const { data: userData } = useCurrentUser();
  const user = userData?.data;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="rounded-full overflow-hidden border border-border/80 text-xl mr-5 hover:cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/30"
        >
          <button
            className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 text-primary font-semibold text-sm shadow-xs focus:outline-none"
            aria-label="User menu"
          >
            {user?.profileImageId ? (
              <img
                src={DefaultProfileImage}
                alt={user.fullName || "User profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4 w-60 p-2 shadow-xl border-border/60">
          {user && (
            <>
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.fullName}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 capitalize bg-primary/10 text-primary border-0 font-medium"
                    >
                      {user.role || "Member"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5" />
            </>
          )}

          <DropdownMenuGroup>
            {data.map((item) => (
              <DropdownMenuItem
                key={item.name}
                asChild={!!item.href}
                disabled={item.isLoading}
                className={`cursor-pointer rounded-md transition-colors ${item.color || "text-foreground hover:bg-muted"} ${
                  item.isLoading ? "opacity-75 cursor-not-allowed pointer-events-none" : ""
                }`}
                onSelect={(event) => {
                  if (item.function) {
                    event.preventDefault();
                    if (!item.isLoading) {
                      item.function();
                    }
                  }
                }}
              >
                {item.href ? (
                  <Link
                    to={item.href}
                    className="w-full flex items-center px-2 py-1.5 text-sm font-medium"
                  >
                    <item.icon className="size-4 mr-2.5 text-muted-foreground group-hover:text-inherit" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <div className="w-full flex items-center px-2 py-1.5 text-sm font-medium">
                    {item.isLoading ? (
                      <Spinner className="size-4 mr-2.5 shrink-0" />
                    ) : (
                      <item.icon className="size-4 mr-2.5 shrink-0" />
                    )}
                    <span>{item.isLoading ? (item.loadingText || "Loading...") : item.name}</span>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

