"use client";
import { CardDetailprops } from "@/types/component";

export default function DetailCard({
  title,
  value,
  description,
  bgColor,
  iconColor,
  Icon,
  onClick,
  isActive,
}: CardDetailprops) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      {/* Icon */}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor} text-white`}>
        <Icon size={24} />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
}
