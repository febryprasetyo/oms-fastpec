"use client";
import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import dynamic from "next/dynamic";
import MonitoringCardSkeleton from "../features/skeleton/MonitoringCardSkeleton";

const MonitoringCard = dynamic(
  () => import("@/components/features/card/MonitoringCard"),
  { loading: MonitoringCardSkeleton },
);
const MonitoringCardBod = dynamic(
  () => import("@/components/features/card/MonitoringCardBod"),
  { loading: MonitoringCardSkeleton },
);

type Props = {
  id: string;
};
const defaultValue = {
  BOD: 0,
  COD: 0,
  CT: 0,
  DEPTH: 0,
  DO: 0,
  id: "",
  N: 0,
  NO2: 0,
  "NO3-3": 0,
  ORP: 0,
  PH: 0,
  Temperature: 0,
  time: "",
  TSS: 0,
  TUR: 0,
  uuid: "",
};

export default function MonitoringSection({ id }: Props) {
  const [monitoringData, setmonitoringData] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const topic = "mqtt_ccb3aad79fe5";

  useEffect(() => {
    const client = mqtt.connect(process.env.NEXT_PUBLIC_WS_URL as string);
    client.subscribe(topic);

    client.on("message", (_topic, message) => {
      const jsonString = JSON.parse(message.toString());
      const uuidx = jsonString["uuid"];
      if (uuidx == id) {
        setmonitoringData(jsonString.data[jsonString.data.length - 1]);
        setIsLoaded(true);
      }
    });
    return () => {
      client.end();
      setIsLoaded(false);
    };
  }, [id]);

  return (
    <section>
      {isLoaded && (
        <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5">
          <MonitoringCard
            title="Temperature"
            unit="°C"
            value={monitoringData.Temperature.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="DO"
            unit="mg/L"
            value={monitoringData.DO.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="Turbidity"
            unit="NTU"
            value={monitoringData.TUR.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="TDS"
            unit="mg/L"
            value={monitoringData.CT.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />

          <MonitoringCard
            title="PH"
            unit="pH"
            value={monitoringData.PH.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="ORP"
            unit="mV"
            value={monitoringData.ORP.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />

          <MonitoringCardBod
            title="BOD"
            unit="mg/L"
            cod={monitoringData.COD}
            value={monitoringData.BOD.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="COD"
            unit="mg/L"
            value={monitoringData.COD.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />

          <MonitoringCard
            title="TSS"
            unit="mg/L"
            value={monitoringData.TSS.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="Amonia"
            unit="mg/L"
            value={monitoringData.N.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="Kedalaman"
            unit="m"
            value={monitoringData.DEPTH.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="Nitrat"
            unit="mg/L"
            value={monitoringData["NO3-3"].toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
          <MonitoringCard
            title="Nitrit"
            unit="mg/L"
            value={monitoringData.NO2.toFixed(2)}
            time={monitoringData.time.split(" ")[1]}
            date={monitoringData.time.split(" ")[0]}
          />
        </div>
      )}
      {!isLoaded && (
        <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {Array.from({ length: 13 }).map((_, index) => (
            <MonitoringCardSkeleton key={index} />
          ))}
        </div>
      )}
    </section>
  );
}
