import { useValidateMeeting } from "@/util/api/api-hooks/use-meeting";
import { DashboardView } from "./Dashboard.view";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const DashboardContainer = () => {

  const navigate = useNavigate()
  const { isPending, mutate } = useValidateMeeting()
  
  const handleJoinMeeting = (roomId: string) => {
    const code = roomId.includes('/meeting/') ? roomId.split('/meeting/')[1].split('/')[0] : roomId.trim()
    if (!code) {
      toast.error("Please enter a valid meeting code")
      return
    }
    
    mutate(code, {
      onSuccess: () => {
        navigate(`/meeting/${code}`)
        toast.success('Room joined successfully')
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || "Invalid meeting code")
        } else {
          toast.error("Invalid meeting code")
        }
      }
    })
  }
  return <DashboardView isPending={isPending} handleJoinMeeting={handleJoinMeeting} />;
};
