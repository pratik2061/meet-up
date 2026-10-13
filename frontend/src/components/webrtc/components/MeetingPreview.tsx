import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiMicrophone } from "react-icons/hi2";
import Webcam from "react-webcam";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MEETING_TYPES = [
  { value: "casualMeeting", label: "Casual Meeting" },
  { value: "formalMeeting", label: "Formal Meeting" },
  { value: "studyMeeting", label: "Study Meeting" },
  { value: "otherMeeting", label: "Other" },
] as const;

interface handleJoinProps {
  onJoin: (micStatus: boolean, cameraStatus: boolean, meetingType: string) => void;
  isPending: boolean;
}

function MeetingPreview({ onJoin, isPending }: handleJoinProps) {
  const webCamRef = useRef<Webcam>(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [meetingType, setMeetingType] = useState<string>("casualMeeting");

  const handleCameraChange = (enabled: boolean) => {
    setIsCameraOn(enabled);

    const stream = webCamRef.current?.stream;

    stream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  };

  const handleMicrophoneChange = (enabled: boolean) => {
    setIsMicOn(enabled);

    const stream = webCamRef.current?.stream;

    stream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  };

  const handleJoinMeeting = () => {
    const stream = webCamRef.current?.stream;
    if (!stream) {
      toast.error(
        "No stream available. Please check your camera and microphone settings.",
      );
      return;
    }
    onJoin(isMicOn, isCameraOn, meetingType);
  };

  return (
    <section className="w-full h-full px-4 py-2">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 lg:gap-6 ">
        <div className="flex items-center justify-center min-h-0 ">
          <div className="relative w-full max-w-4xl aspect-video overflow-hidden rounded-xl bg-slate-700">
            <Webcam
              ref={webCamRef}
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user",
              }}
              className={`h-full w-full object-cover ${
                isCameraOn ? "block" : "hidden"
              }`}
              audio
              muted
              mirrored
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <p className="lg:text-2xl md:text-xl text-lg">
                  Your camera is off
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 flex flex-col lg:justify-center gap-6 lg:px-4 ">
          <FieldGroup className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FieldLabel
              htmlFor="switch-camera"
              className="hover:cursor-pointer hover:border hover:border-primary/30"
            >
              <Field orientation="horizontal">
                <FieldContent className="">
                  <FieldTitle className="">
                    <CameraIcon className="size-5" /> Camera
                  </FieldTitle>
                  <FieldDescription className="py-2">
                    Allow others to see you during the video call.
                  </FieldDescription>
                </FieldContent>

                <Switch
                  id="switch-camera"
                  checked={isCameraOn}
                  onCheckedChange={handleCameraChange}
                />
              </Field>
            </FieldLabel>

            <FieldLabel
              htmlFor="switch-microphone"
              className="hover:cursor-pointer hover:border hover:border-primary/30"
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>
                    <HiMicrophone className="size-5" /> Microphone
                  </FieldTitle>
                  <FieldDescription className="py-2">
                    Allow others to hear you during the video call.
                  </FieldDescription>
                </FieldContent>

                <Switch
                  id="switch-microphone"
                  checked={isMicOn}
                  onCheckedChange={handleMicrophoneChange}
                />
              </Field>
            </FieldLabel>
          </FieldGroup>

          {/* Meeting Type Dropdown */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="meeting-type-select" className="text-sm font-medium text-foreground/80">
              Meeting Type
            </Label>
            <Select
              value={meetingType}
              onValueChange={setMeetingType}
            >
              <SelectTrigger
                id="meeting-type-select"
                className="w-full h-12 text-md "
              >
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="md:text-lg text-md py-6 hover:cursor-pointer bg-primary/80 hover:bg-primary"
            onClick={handleJoinMeeting}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <Spinner className="mr-2" />
                starting meeting...
              </span>
            ) : (
              "start meeting"
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default MeetingPreview;
