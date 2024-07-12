import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/layout/Sidebar"), {
  ssr: false,
});
const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
});
const MainContainer = dynamic(
  () => import("@/components/layout/MainContainer"),
  {
    ssr: false,
  },
);

type Props = {
  children: React.ReactNode;
};

export default function ProtectedLayout({ children }: Props) {
  return (
    <>
      <Sidebar />
      <Header />
      <MainContainer>{children}</MainContainer>
    </>
  );
}
