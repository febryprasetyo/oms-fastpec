import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  id: number;
  location: string;
  imgUrl: string;
};

export default function StasiunCard({ name, id, location, imgUrl }: Props) {
  return (
    <Link href={`/monitoring/${id}`}>
      <div className="w-full bg-white shadow rounded-lg overflow-hidden h-full dark:bg-darkSecondary">
        <div className="relative w-full aspect-video">
          <Image src={imgUrl} fill alt="stasiun" className="object-cover" />
        </div>
        <div className="p-5 space-y-1">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-slate-700 dark:text-slate-100 text-lg">
            {" "}
            Id : {id}
          </p>
          <p className="text-slate-400 ">{location}</p>
        </div>
      </div>
    </Link>
  );
}
