"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import mqtt from "mqtt";
import dynamic from "next/dynamic";
import MonitoringCardSkeleton from "../features/skeleton/MonitoringCardSkeleton";
import MonitCard from "../features/card/MonitCard";

import Klhk from "@/assets/img/logo-klh.png";
import Logo from "@/assets/img/logo.png";
import SuhuCard from "../features/card/SuhuCard";
import MonitoringBadge from "../features/badge/MonitoringBadege";
import Moment from "react-moment";
import moment from "moment";
import DateCard from "../features/card/DateCard";

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
  Read_Status: 0,
  Pump_Status: 0,
  CV_Status: 0,
};

export default function MonitSection({ id }: Props) {
  const [monitoringData, setmonitoringData] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const topic = "mqtt_ccb3aad79fe5";

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

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
      if (monitoringData.ORP !== 0) {
        setIsOpen((isOpen) => !isOpen);
      }
    });
    return () => {
      client.end();
      setIsLoaded(false);
    };
  }, [id, monitoringData.ORP]);

  return (
    <div className="flex flex-row">
      {/* Left side */}
      <div className="mx-4 h-screen basis-1/3 p-8">
        {/* Logo */}
        <div className="flex h-20 flex-row justify-center">
          <div className="flex flex-row gap-6 ">
            <Image src={Klhk} alt="Logo KLHK" height={80} width={0} />
            <Image src={Logo} alt="Logo KLHK" height={80} width={0} />
          </div>
        </div>
        {/* Card tanggal SUhu */}
        <div className="grid grid-cols-2 gap-4 pt-8">
          <DateCard
            title="Tanggal"
            day={date.toLocaleDateString()}
            date={date.toLocaleDateString()}
            time={monitoringData.time.split(" ")[1]}
          />
          <SuhuCard
            title="Suhu"
            value={monitoringData.Temperature.toFixed(2)}
            unit="°C"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="flex flex-col gap-2">
            <div className="text-center text-xl font-extrabold">
              Status Koneksi
            </div>
            <MonitoringBadge title="Data Loger" value={1} />
            <MonitoringBadge title="PLC" value={1} />
            <MonitoringBadge title="Server" value={1} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-center text-xl font-extrabold">Control</div>
            <MonitoringBadge title="Pump" value={monitoringData.Pump_Status} />
            <MonitoringBadge title="CV" value={monitoringData.CV_Status} />
            <MonitoringBadge title="State" value={monitoringData.Read_Status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="flex flex-col gap-2">
            <div className="text-center text-xl font-extrabold">
              Status Sensor
            </div>
            <MonitoringBadge
              title="Multiparameter"
              value={monitoringData.Temperature}
            />
            <MonitoringBadge title="UV 254" value={monitoringData.COD} />
            <MonitoringBadge title="Amonia" value={monitoringData.N} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-center text-xl font-extrabold text-slate-100">
              {" "}
              .
            </div>
            <MonitoringBadge title="Level" value={monitoringData.DEPTH} />
            <MonitoringBadge title="NO3" value={monitoringData["NO3-3"]} />
            {monitoringData.ORP !== 0 && (
              <MonitoringBadge title="NO2" value={monitoringData.NO2} />
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="h-full basis-4/5 rounded-l-3xl bg-white p-8">
        <div className="py-4 text-center font-sans text-4xl font-extrabold text-gray-900">
          ONLINE MONITORING SYSTEM
        </div>
        <div>
          <section>
            <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3 3xl:grid-cols-3">
              <MonitCard
                title="DO"
                unit="mg/L"
                value={monitoringData.DO.toFixed(2)}
                icons="DO"
              />
              <MonitCard
                title="TURBIDITY"
                unit="NTU"
                value={monitoringData.TUR.toFixed(2)}
                icons="TUR"
              />
              <MonitCard
                title="TDS"
                unit="ppm"
                value={monitoringData.CT.toFixed(2)}
                icons="TDS"
              />
              <MonitCard
                title="pH"
                unit="pH"
                value={monitoringData.PH.toFixed(2)}
                icons="PH"
              />
              {monitoringData.ORP !== 0 && (
                <MonitCard
                  title="ORP"
                  unit="mg/L"
                  value={monitoringData.ORP.toFixed(2)}
                  icons="ORP"
                />
              )}
              <MonitCard
                title="BOD"
                unit="mg/L"
                value={monitoringData.BOD.toFixed(2)}
                icons="BOD"
              />
              <MonitCard
                title="COD"
                unit="mg/L"
                value={monitoringData.COD.toFixed(2)}
                icons="COD"
              />
              <MonitCard
                title="TSS"
                unit="mg/L"
                value={monitoringData.TSS.toFixed(2)}
                icons="TSS"
              />
              <MonitCard
                title="AMONIA"
                unit="mg/L"
                value={monitoringData.N.toFixed(2)}
                icons="NH4"
              />
              <MonitCard
                title="DEPTH"
                unit="M"
                value={monitoringData.DEPTH.toFixed(2)}
                icons="LVL"
              />
              <MonitCard
                title="NO3"
                unit="mg/L"
                value={monitoringData["NO3-3"].toFixed(2)}
                icons="NO3"
              />

              {monitoringData.ORP !== 0 && (
                <MonitCard
                  title="NO2"
                  unit="mg/L"
                  value={monitoringData.NO2.toFixed(2)}
                  icons="NO2"
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
