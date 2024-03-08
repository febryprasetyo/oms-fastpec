import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  id: string;
  imgUrl: string;
  city: string;
  province: string;
};

export default function StasiunCard({
  name,
  id,
  imgUrl,
  city,
  province,
}: Props) {
  return (
    <Link href={`/monitoring/${id}`}>
      <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow dark:bg-darkSecondary">
        <div className="relative aspect-video w-full">
          <Image
            src={imgUrl}
            fill
            alt="stasiun"
            className="object-cover"
            quality={60}
          />
        </div>
        <div className="space-y-1 p-5">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-100">
            {" "}
            Id Mesin : {id}
          </p>
          <p className="text-slate-500 ">
            {city} , {province}
          </p>
        </div>
      </div>
    </Link>
  );
}
