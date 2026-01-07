"use client";
import React, { useEffect, useState } from "react";
import MonitoringDesktopView from "./MonitoringDesktopView";
import MonitoringMobileView from "./MonitoringMobileView";

type Props = {
  id: string;
};

export type MonitoringData = {
  uuid: string;
  id_stasiun: string;
  time: string;
  status: 'hidup' | 'mati';
  Y4000_Status: 'on' | 'off';
  UV254_Status: 'on' | 'off';
  NH4_Status: 'on' | 'off';
  Depth_Status: 'on' | 'off';
  NO2_Status: 'on' | 'off';
  NO3_Status: 'on' | 'off';
  Temperature: number;
  Status_Temperature?: string;
  DO: number;
  Status_DO?: string;
  PH: number;
  Status_PH?: string;
  TUR: number;
  Status_TUR?: string;
  BOD: number;
  Status_BOD?: string;
  COD: number;
  Status_COD?: string;
  TSS: number;
  Status_TSS?: string;
  DEPTH: number;
  Status_DEPTH?: string;
  'NO3-3': number;
  Status_NO3_3?: string;
  N: number;
  Status_N?: string;
  CT: number;
  Status_CT?: string;
  NO2: number;
  Status_NO2?: string;
  ORP: number;
  Status_ORP?: string;
  Pump_Status: number;
  CV_Status: number;
  Read_Status: number;
  IKA: number;
  IKA_Param?: string;
  IKA_Value?: number;
  Control_Menu?: string;
};

const defaultData: MonitoringData = {
  uuid: "",
  id_stasiun: "",
  time: "",
  status: "mati",
  Y4000_Status: "off",
  UV254_Status: "off",
  NH4_Status: "off",
  Depth_Status: "off",
  NO2_Status: "off",
  NO3_Status: "off",
  Temperature: 0,
  Status_Temperature: "NORMAL",
  DO: 0,
  Status_DO: "NORMAL",
  PH: 0,
  Status_PH: "NORMAL",
  TUR: 0,
  Status_TUR: "NORMAL",
  BOD: 0,
  Status_BOD: "NORMAL",
  COD: 0,
  Status_COD: "NORMAL",
  TSS: 0,
  Status_TSS: "NORMAL",
  DEPTH: 0,
  Status_DEPTH: "NORMAL",
  'NO3-3': 0,
  Status_NO3_3: "NORMAL",
  N: 0,
  Status_N: "NORMAL",
  CT: 0,
  Status_CT: "NORMAL",
  NO2: 0,
  Status_NO2: "NORMAL",
  ORP: 0,
  Status_ORP: "NORMAL",
  Pump_Status: 0,
  CV_Status: 0,
  Read_Status: 0,
  IKA: 0,
  IKA_Param: "-",
  IKA_Value: 0,
};

export default function MonitoringSection({ id }: Props) {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [stationName, setStationName] = useState("");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem(`station_name_${id}`);
      if (storedName) {
        setStationName(storedName);
      }
    }
  }, [id]);

  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}/monitoring/${id}`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket Connected");
        setIsOffline(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("🔍 Raw WebSocket Message:", event.data);
          
          if (message.type === 'monitoring' && message.data) {
            console.log("📨 Received Data Object:", message.data);
            const raw = message.data;
            const mappedData: MonitoringData = {
              ...defaultData,
              uuid: raw.uuid,
              id_stasiun: raw.id_stasiun,
              time: raw.time,
              status: raw.status,

              // Status Sensors
              Y4000_Status: raw.y4000_status,
              UV254_Status: raw.uv254_status,
              NH4_Status: raw.nh4_status,
              Depth_Status: raw.depth_status,
              NO2_Status: raw.no2_status,
              NO3_Status: raw.no3_status,

              // Values
              Temperature: raw.temperature ?? 0,
              Status_Temperature: raw.status_temperature,
              DO: Number(raw.do_) || 0, // Handle "-3" string
              Status_DO: raw.status_do,
              PH: raw.ph ?? 0,
              Status_PH: raw.status_ph,
              TUR: Number(raw.tur) || 0,
              Status_TUR: raw.status_tur,
              BOD: raw.bod ?? 0,
              Status_BOD: raw.status_bod,
              COD: raw.cod ?? 0,
              Status_COD: raw.status_cod,
              TSS: raw.tss ?? 0,
              Status_TSS: raw.status_tss,
              DEPTH: raw.depth ?? 0,
              Status_DEPTH: raw.status_depth,
              'NO3-3': raw.no3_3 ?? 0,
              Status_NO3_3: raw.status_no3_3,
              N: raw.n ?? 0,
              Status_N: raw.status_n,
              CT: raw.ct ?? 0,
              Status_CT: raw.status_ct,
              NO2: raw.no2 ?? 0,
              Status_NO2: raw.status_no2,
              ORP: raw.orp ?? 0,
              Status_ORP: raw.status_orp,

              // Control Status (convert bool to number if type allows, or keep as boolean if simple cast works. Type says number.)
              Pump_Status: raw.pump_status ? 1 : 0, 
              CV_Status: raw.cv_status ? 1 : 0,
              Read_Status: raw.read_status ? 1 : 0,

              // IKA (Extract score from object)
              IKA: raw.ika?.score ?? 0,
              IKA_Param: raw.ika?.param_dominan ?? "-",
              IKA_Value: raw.ika?.indices?.find((i: any) => i.name.toLowerCase() === (raw.ika?.param_dominan || "").toLowerCase())?.value ?? 0,
            };

            setMonitoringData(mappedData);
            setIsLoaded(true);
            setIsOffline(message.data.status === 'mati');
            
            // Update station name if available from data
            if (message.data.id_stasiun && message.data.id_stasiun !== '-') {
               setStationName(message.data.id_stasiun);
            }
          } else if (message.type === 'error') {
            console.error("❌ WebSocket Error Message:", message.message);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket Disconnected, reconnecting in 3s...");
        setIsOffline(true);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [id]);

  return (
    <>
      <MonitoringMobileView
        monitoringData={monitoringData}
        isLoaded={isLoaded}
        isOffline={isOffline}
        date={date}
        stationName={stationName}
        id={id}
      />

      <MonitoringDesktopView
        monitoringData={monitoringData}
        isLoaded={isLoaded}
        isOffline={isOffline}
        date={date}
        stationName={stationName}
        id={id}
      />
    </>
  );
}
