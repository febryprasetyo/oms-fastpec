import Header from "@/components/layout/Header";
import MainContainer from "@/components/layout/MainContainer";
import Sidebar from "@/components/layout/Sidebar";

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
