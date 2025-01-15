type Props = {
  title: string;
  value: string | number;
};

export default function MonitoringBadge({ title, value }: Props) {
  return (
    <div
      className={
        value != 0
          ? "rounded-lg bg-primary text-white"
          : "rounded-lg bg-slate-500 text-white"
      }
    >
      <p className="py-2 text-center">{title}</p>
    </div>
  );
}
