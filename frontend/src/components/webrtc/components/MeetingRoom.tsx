import { Button } from "@/components/ui/button";

interface MeetingRoomProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  onLeave: () => void;
}

function MeetingRoom({ isMicOn, isCameraOn, onLeave }: MeetingRoomProps) {
  return (
    <section className="flex min-h-full flex-col bg-slate-950 p-4 text-white">
      <header className="flex items-center justify-between pb-4">
        <div>
          <p className="text-sm text-slate-400">Meeting room</p>
          <h1 className="text-xl font-semibold">Ready to connect</h1>
        </div>

        <Button variant="destructive" onClick={onLeave}>
          Leave meeting
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center">
        <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-2xl bg-slate-800">
          <p className="text-slate-400">
            Waiting for another participant to join…
          </p>
        </div>
      </main>

      <footer className="mt-4 flex items-end justify-end">
        <div className="flex aspect-video w-56 flex-col items-center justify-center rounded-xl bg-slate-700 shadow-lg">
          <p className="font-medium">You</p>

          <p className="mt-1 text-sm text-slate-300">
            Camera: {isCameraOn ? "On" : "Off"}
          </p>

          <p className="text-sm text-slate-300">
            Microphone: {isMicOn ? "On" : "Off"}
          </p>
        </div>
      </footer>
    </section>
  );
}

export default MeetingRoom;
