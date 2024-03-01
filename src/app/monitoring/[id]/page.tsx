import MonitoringCard from "@/components/features/card/MonitoringCard";
import React from "react";

type Props = {
  params: {
    id: string;
  };
};

export default function page({ params: { id } }: Props) {
  return (
    <>
      <section className="">
        <h1 className="text-3xl font-semibold">Id Stasiun : {id}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-7 gap-5">
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
          <MonitoringCard
            title="Temperature"
            value="30  °C"
            date="27-02-2024"
            time="22:50:57"
          />
        </div>
      </section>
    </>
  );
}
