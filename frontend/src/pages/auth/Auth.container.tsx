import { IoVideocam } from "react-icons/io5";
import { GiAerialSignal } from "react-icons/gi";
import { CgCalendarDates } from "react-icons/cg";
import { HiUsers } from "react-icons/hi2";

import { AuthView, type LoginRequestPayload } from "./Auth.view";
import { useAuthLogin } from "@/util/api/api-hooks/use-auth";
import { useNavigate } from "react-router-dom";

export const AuthContainer = () => {
  const items = [
    {
      title: "Meetings",
      description: "Host and join secure HD meetings with ease.",
      icon: IoVideocam,
      color: "text-primary/80",
    },
    {
      title: "Live Streaming",
      description: "Stream events live to a large audience in real-time.",
      icon: GiAerialSignal,
      color: "text-green-600/80",
    },
    {
      title: "Events & Webinars",
      description: "Organize official events or connect with community.",
      icon: CgCalendarDates,
      color: "text-yellow-600/80",
    },
    {
      title: "Chats & Collaboration",
      description: "Instant messaging , screen sharing and more.",
      icon: HiUsers,
      color: "text-blue-600/80",
    },
  ];

  const { isPending, mutate } = useAuthLogin();
  const navigate = useNavigate();

  function handleLogin(data: LoginRequestPayload) {
    mutate(data, {
      onSuccess: () => {
        navigate("/dashboard", { replace: true });
      },
    });
  }
  return <AuthView items={items} isPending={isPending} loginMutate={handleLogin} />;
};
