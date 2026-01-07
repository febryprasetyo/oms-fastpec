import MaintenanceSection from "@/components/section/MaintenanceSection";
import { cookies } from "next/headers";

export default function MaintenancePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value || "";

  return <MaintenanceSection cookie={token} />;
}
