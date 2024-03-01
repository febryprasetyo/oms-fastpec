import { Radio, RefreshCwOff } from "lucide-react";

type Props = {
  title: string;
  value: string;
  date: string;
  time: string;
};

export default function MonitoringCard({ title, value, date, time }: Props) {
  return (
    <div className="w-full rounded-xl shadow bg-white flex flex-col items-center justify-between overflow-hidden dark:bg-darkSecondary">
      <div className="text-center w-full p-5 space-y-5">
        <h2 className="text-3xl font-semibold text-dark_accent dark:text-white">
          {title}
        </h2>
        <div className=" w-full bg-primary text-white rounded-xl text-center py-5  px-10">
          <p className="text-[50px] font-bold">{value}</p>
          <p className="text-xl font-medium">{date}</p>
          <p className="text-xl font-medium">{time}</p>
        </div>
      </div>
      <div className="flex justify-evenly w-full bg-white py-2 dark:bg-darkSecondary">
        <Radio size={35} className="text-green-500" />
        <RefreshCwOff size={35} className="text-danger" />
      </div>
    </div>
  );
}
