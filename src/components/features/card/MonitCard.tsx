import Image from "next/image";

type Props = {
  title: string;
  value: string | number;
  unit: string;
  icons: string;
};

export default function MonitoringCard({ title, value, unit, icons }: Props) {
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-3xl ">
      <div className=" grid w-full grid-cols-2">
        {/* Icon */}
        <div className="flex h-full flex-col items-center justify-center bg-slate-100 p-2">
          <Image
            src={`https://www.medigas.co.id/wp-content/uploads/2025/01/${icons}.png`}
            alt="Logo"
            width={100}
            height={200}
          />
        </div>
        {/* Parameter */}
        <div className=" flex w-full flex-col items-center  bg-slate-100 py-0  text-center text-slate-900">
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-4xl font-bold leading-none">{value}</p>
            <p className="text-base">{unit}</p>
            {/* <Radio
              size={35}
              className={value != 0 ? "text-green-500" : "text-slate-500"}
            /> */}
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
