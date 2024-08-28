import { Radio, RefreshCwOff } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  cod: string | number;
  date: string | undefined;
  time: string | undefined;
  unit: string;
};

export default function MonitoringCardBod({
  title,
  value,
  date,
  time,
  unit,
  cod,
}: Props) {
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-xl bg-white shadow dark:bg-darkSecondary">
      <div className="w-full space-y-2 p-5 text-center">
        <h2 className="text-3xl font-semibold text-dark_accent dark:text-white">
          {title}
        </h2>
        <div className=" w-full space-y-2 rounded-xl bg-primary px-10 py-5  text-center text-white">
          <p className="text-[50px]  font-bold leading-none">{value}</p>
          <p className="text-2xl font-bold">{unit}</p>
          <p className="text-lg font-medium">
            {date ? date : "-"}
            <span> </span>
            {time ? time : "-"}
          </p>
        </div>
      </div>
      <div className="flex w-full justify-evenly bg-white pb-4 dark:bg-darkSecondary">
        <Radio
          size={35}
          className={value != 0 ? "text-green-500" : "text-slate-500"}
        />
        <RefreshCwOff
          size={35}
          className={cod == 0 ? "text-danger" : "text-slate-500"}
        />
      </div>
    </div>
  );
}
