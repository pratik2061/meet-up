import systemErrorImage from "@/assets/system-error.png";

export const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-background flex overflow-hidden">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-red-50 items-center justify-center p-12">
        <div className="max-w-xl">
          <img
            src={systemErrorImage}
            alt="System Error"
            className="w-full object-contain"
          />

          <div className="mt-6 text-center">
            <p className="text-red-600 font-semibold uppercase tracking-wider">
              System Error
            </p>

            <h3 className="mt-2 text-2xl font-bold text-foreground">
              Something went wrong
            </h3>

            <p className="mt-2 text-muted-foreground">
              Our servers encountered an unexpected issue while processing your
              request.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Interdimensional System Error 404
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Oops... wrong universe, wrong page.
          </h2>

          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            The page you are looking for does not exist in this timeline. Our
            system tried to reconnect the route, but the signal was lost.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => window.history.back()}
              className="rounded-xl border px-5 py-3 font-medium transition hover:bg-muted"
            >
              Go Back
            </button>

            <a
              href="/dashboard"
              className="rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-lg shadow-red-600/20 transition hover:bg-primary/90"
            >
              Return Home
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Tip: Check the URL coordinates before jumping dimensions.
          </p>
        </div>
      </div>
    </div>
  );
};
