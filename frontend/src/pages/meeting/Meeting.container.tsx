import { useValidateMeeting } from "@/util/api/api-hooks/use-meeting";
import MeetingView from "./Meeting.view";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

function MeetingContainer() {

  const [meetingCode, setMeetingCode] = useState("");
  const navigate = useNavigate();

  const { mutate: validateMeeting, isPending } = useValidateMeeting();

  const handleJoin = async () => {
    if (!meetingCode.trim()) return;

    const code = meetingCode.includes('/meeting/')
      ? meetingCode.split('/meeting/')[1].split('/')[0]
      : meetingCode.trim();
    if (!code) {
      toast.error("Please enter a valid meeting code")
      return
    }
    validateMeeting(code, {
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

  };

  return <MeetingView
    meetingCode={meetingCode}
    setMeetingCode={setMeetingCode}
    handleJoin={handleJoin}
    isPending={isPending} />;
}

export default MeetingContainer;
