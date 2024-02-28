import { Radio, RefreshCcw } from "lucide-react";

type Props = {
  title: string;
  value: string;
  date: string;
};

export default function MonitoringCard({ title, value, date }: Props) {
  return (
    <div className="w-full rounded-xl h-[300px] shadow bg-white p-5 flex flex-col items-center justify-between dark:bg-darkSecondary">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="text-[50px] font-bold">{value}</p>
      <p className="text-xl font-medium">{date}</p>
      <div className="flex justify-evenly w-full">
        <Radio size={40} className="text-green-500" />
        <RefreshCcw size={40} className="text-danger" />
      </div>
    </div>
  );
}
