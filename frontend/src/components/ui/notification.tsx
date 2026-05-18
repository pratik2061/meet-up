import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger } from "./dropdown-menu"

export const Notification = ()=>{
    return <>
                {/* this is fornotification section component */}
        <DropdownMenu>
          <DropdownMenuTrigger className="mr-5 hover:cursor-pointer">
            <Bell  size={25} className=""/>
          </DropdownMenuTrigger>

        </DropdownMenu>
    </>
}