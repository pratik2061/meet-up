import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import DefaultProfileImage from "@/assets/default_profile.webp";

interface ProfileProps {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string | "";
}

export const Profile = ({ data }: { data: ProfileProps[] }) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="rounded-full overflow-hidden border text-xl mr-5 hover:cursor-pointer"
        >
          <button className="w-10 h-10 flex items-center overflow-hidden">
            <img src={DefaultProfileImage} alt="default image" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4 w-40">
          <DropdownMenuGroup className="">
            {data.map((item) => (
              <DropdownMenuItem key={item.name} className={`${item.color}`}>
                {
                  <a
                    href={item.href}
                    className={` w-full flex items-center p-2 `}
                  >
                    <item.icon className="size-5 mr-2" />
                    <span>{item.name}</span>
                  </a>
                }
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
