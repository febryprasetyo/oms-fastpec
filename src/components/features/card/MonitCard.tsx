import Image from "next/image";
import { imageMap } from "@/assets/img";

type Props = {
  title: string;
  value: string | number;
  unit: string;
  icons: string;
};

export default function MonitoringCard({ title, value, unit, icons }: Props) {
   const imageSrc = imageMap[icons.toUpperCase()];
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-3xl ">
      <div className=" grid w-full grid-cols-2">
        {/* Icon */}
        <div className="flex h-full flex-col items-center justify-center bg-slate-100 p-2">
          <Image
            src={imageSrc}
            alt={`${icons} sensor`}
            width={100}
            height={200}
          />
        </div>
        {/* Parameter */}
        <div className=" flex w-full flex-col items-center  bg-slate-100 py-0  text-center text-slate-900">
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-2xl font-bold leading-none lg:text-4xl">{value}</p>
            <p className="text-base">{unit}</p>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-evenly bg-primary py-2 ">
        {/* Title */}
        <h2 className="text-2xl font-bold text-dark_accent dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}
