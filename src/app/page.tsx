import StasiunCard from "@/components/features/card/StasiunCard";

export default function Home() {
  return (
    <>
      <section className="">
        <h1 className="text-3xl font-semibold">List Stasiun</h1>
        <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
          <StasiunCard
            name="Stasiun Bangli 1"
            id={240305005225028}
            location="Kabupaten Bangli , Bali"
            imgUrl="https://images.unsplash.com/photo-1533077162801-86490c593afb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />

          <StasiunCard
            name="Musiwaras 2"
            id={240305005225030}
            location="Kabupaten Musiwaras , Sumatera Selatan"
            imgUrl="https://images.unsplash.com/photo-1495774539583-885e02cca8c2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
          <StasiunCard
            name="Stasiun Klungkung"
            id={240305005225029}
            location="Kabupaten Klungkung , Bali"
            imgUrl="https://images.unsplash.com/photo-1526529613260-5f7cad1eb4b4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
      </section>
    </>
  );
}
