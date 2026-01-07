import MonitoringSection from "@/components/section/MonitoringSection";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params: { id } }: Props) {
  return (
    <main className="h-screen w-full">
      <MonitoringSection id={id} />
    </main>
  );
}
