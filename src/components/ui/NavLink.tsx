import Link from "next/link";

type Props = {
  pathname: string;
  to: string;
  children: React.ReactNode;
};

export default function NavLink({ pathname, children, to }: Props) {
  return (
    <Link href={to} className="flex justify-center">
      <div
        className={`p-2 hover:bg-primary dark:text-white ${
          pathname == to ? "bg-primary text-white" : ""
        } rounded-lg hover:text-white`}
      >
        {children}
      </div>
    </Link>
  );
}
