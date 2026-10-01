import { FichaCaso } from "@/components/casos/FichaCaso";
import { Header } from "@/components/ui/Header";

export default async function FichaCasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Header />
      <FichaCaso id={id} />
    </>
  );
}
