"use client";
import MonitCard from "@/components/features/card/MonitCard";
import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import MonitSection from "@/components/section/MonitSection";
type Props = {
  params: {
    id: string;
  };
};
const id = 240305005321334;
export default async function page({
  params: { id = "2403050053212991" },
}: Props) {
  return (
    <main className="h-screen w-full">
      <MonitSection id={id} />
    </main>
  );
}
