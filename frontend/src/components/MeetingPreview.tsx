import { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { Switch } from "./ui/switch";

function MeetingPreview() {
  const webCamRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  return (
    <section className="w-full h-full px-4 py-2">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[55%_auto] gap-6">
        <div className="flex items-center justify-center rounded-xl  min-h-0">
          <div className="relative w-full max-w-3xl aspect-video overflow-hidden rounded-xl bg-black">
            {isCameraOn ? (
              <Webcam
                ref={webCamRef}
                audio={isMicOn}
                videoConstraints={{
                  width: 7680,
                  height: 4320,
                  facingMode: "user",
                }}
                className="h-full w-full object-cover"
                mirrored
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white">
                <p>Camera is off</p>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 flex items-center border">
          <FieldGroup className="w-full max-w-sm">
            <FieldLabel htmlFor="switch-share">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Share across devices</FieldTitle>
                  <FieldDescription>
                    Focus is shared across devices, and turns off when you leave
                    the app.
                  </FieldDescription>
                </FieldContent>
                <Switch id="switch-share" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="switch-notifications">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Enable notifications</FieldTitle>
                  <FieldDescription>
                    Receive notifications when focus mode is enabled or
                    disabled.
                  </FieldDescription>
                </FieldContent>
                <Switch id="switch-notifications" defaultChecked />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </div>
      </div>
    </section>
  );
}

export default MeetingPreview;
