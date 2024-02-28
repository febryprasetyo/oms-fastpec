import StasiunCard from "@/components/features/card/StasiunCard";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="">
        <h1 className="text-3xl font-semibold">List Stasiun</h1>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 py-6">
          <StasiunCard
            name="Stasiun Bangli 1"
            id={240305005225028}
            location="Kabupaten Bangli , Bali"
            imgUrl="https://images.unsplash.com/photo-1547380243-c25d8e5dbe5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />

          <StasiunCard
            name="Musiwaras 2"
            id={240305005225030}
            location="Kabupaten Musiwaras , Sumatera Selatan"
            imgUrl="https://images.unsplash.com/photo-1527839321757-ad3a2f2be351?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
          <StasiunCard
            name="Stasiun Klungkung"
            id={240305005225029}
            location="Kabupaten Klungkung , Bali"
            imgUrl="https://images.unsplash.com/uploads/1413387158190559d80f7/6108b580?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
      </section>
    </>
  );
}
