import { IoVideocam } from "react-icons/io5";
import type { items } from "../Auth.view";
import LaptopImage from "@/assets/login-laptop.png";

interface AuthContentSectionProps {
  items: items[] | { items: items[] };
}

export const AuthContentSection = ({ items }: AuthContentSectionProps) => {
  const featureList = Array.isArray(items) ? items : items.items;
  return (
    <div className="w-full min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div className="flex flex-1 flex-col justify-between gap-10">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-medium sm:text-3xl lg:text-4xl">
              <IoVideocam className="size-8 shrink-0 text-primary/80 sm:size-10 lg:size-12" />
              <span className="text-primary/80">Meet</span>
              <span>Up</span>
            </h1>
            <p className="mt-6 text-3xl font-semibold leading-tight tracking-wide sm:text-4xl lg:text-[42px]">
              Connect. Meet.
              <br />
              Stream. <span className="text-primary/80">Together.</span>
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-gray-900/80 sm:text-lg lg:text-xl">
              Your all-in-one platform for meetings, webinars, live streaming
              and more.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
            <ul className="space-y-6">
              {featureList.map((data) => (
                <li key={data.title} className="flex items-start gap-4">
                  <data.icon className={`${data.color} mt-0.5 size-8 shrink-0 sm:size-10`} />
                  <span className="min-w-0">
                    <p className="text-sm font-semibold sm:text-base">
                      {data.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-900/80 sm:text-base">
                      {data.description}
                    </p>
                  </span>
                </li>
              ))}
            </ul>
            <div className="hidden lg:flex lg:items-end lg:justify-center">
              <div className="w-full max-w-[36rem]">
                <img src={LaptopImage} alt="Laptop" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
