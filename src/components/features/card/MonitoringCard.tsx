import { Radio, RefreshCwOff } from "lucide-react";

type Props = {
  title: string;
  value: string;
  date: string;
  time: string;
};

export default function MonitoringCard({ title, value, date, time }: Props) {
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-xl bg-white shadow dark:bg-darkSecondary">
      <div className="w-full space-y-2 p-5 text-center">
        <h2 className="text-3xl font-semibold text-dark_accent dark:text-white">
          {title}
        </h2>
        <div className=" w-full rounded-xl bg-primary px-10 py-5 text-center  text-white">
          <p className="text-[50px] font-bold">{value}</p>
          <p className="text-xl font-medium">{date}</p>
          <p className="text-xl font-medium">{time}</p>
        </div>
      </div>
      <div className="flex w-full justify-evenly bg-white py-2 dark:bg-darkSecondary">
        <Radio size={35} className="text-green-500" />
        <RefreshCwOff size={35} className="text-danger" />
      </div>
    </div>
  );
}
