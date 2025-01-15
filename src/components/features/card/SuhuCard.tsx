type Props = {
  title: string;
  value: string | number;
  unit: string;
};

export default function SuhuCard({ title, value, unit }: Props) {
  return (
    <div className="flex h-[181px] w-full flex-col items-center justify-between overflow-hidden rounded-3xl bg-white ">
      <div className="flex w-full justify-evenly bg-primary py-2 ">
        {/* Title */}
        <h2 className="text-2xl font-bold text-dark_accent dark:text-white">
          {title}
        </h2>
      </div>

      <div className=" flex h-[130px] w-full flex-col items-center   py-0  text-center text-slate-900">
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-5xl font-bold leading-none">{value}</p>
          <p className="text-2xl">{unit}</p>
        </div>
      </div>
    </div>
  );
}
