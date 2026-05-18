import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

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
          <button className="w-12 h-12 flex items-center overflow-hidden">
            <img
              src="https://imgs.search.brave.com/79URd9v5BJ3THe0zDwW1wKW3Yy1qSslghSVGLQH2Mgs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNDkv/NjcwLzg5NS9zbWFs/bC9hLXBlcnNvbi1z/LXByb2ZpbGUtaWNv/bi1pbi1hLWNpcmNs/ZS1mcmVlLXBuZy5w/bmc"
              alt=""
            />
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
