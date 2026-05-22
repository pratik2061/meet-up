import { IoVideocam } from "react-icons/io5";
import type { AuthviewProps } from "../Auth.view";
import LaptopImage from "/images/login-laptop.png";

export const AuthContentSection = ({ items }: { items: AuthviewProps }) => {
  return (
    <div className="w-full mx-auto">
      <div className="my-10 mx-10  max-h-screen  ">
        <h1 className="lg:text-4xl md:text-2xl text-lg font-medium flex items-center  py-4 px-6">
          <IoVideocam className=" text-primary/80 mx-4 size-12" />
          <span className="text-primary/80">Meet</span>
          Up
        </h1>
        <p className="py-4 px-6 lg:text-[42px] md:text-3xl text-xl  font-semibold tracking-wide">
          Connect. Meet.
          <br />
          Stream. <span className="text-primary/80">Together.</span>
        </p>
        <p className=" px-6 md:text-xl text-lg text-gray-900/80">
          Your all-in-one platform for meetings, <br /> webinars, live streaming
          and more.
        </p>
        <div className="grid grid-cols-[50%_auto]">
          <ul className="py-4 px-8 md:text-2xl text-lg mt-6 space-y-8">
            {items.items.map((data) => (
              <li key={data.title} className="flex px-2 py-2">
                <data.icon className={`${data.color} size-12 mr-6`} />
                <span className="text-sm">
                  <p className="text-[16px] font-semibold mb-2">{data.title}</p>
                  <p className="text-gray-900/80">{data.description}</p>
                </span>
              </li>
            ))}
          </ul>
          <div className=" hidden lg:flex lg:items-center lg:justify-center ">
            <div className="w-130">
              <img src={LaptopImage} alt="Laptop" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
