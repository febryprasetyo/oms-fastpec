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
      <div className="w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="relative w-full aspect-video">
          <Image src={imgUrl} layout="fill" objectFit="cover" alt="stasiun" />
        </div>
        <div className="p-5 space-y-1">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-slate-700 text-lg"> Id : {id}</p>
          <p className="text-slate-500">{location}</p>
        </div>
      </div>
    </Link>
  );
}
