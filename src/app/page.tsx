import { ListaCasos } from "@/components/casos/ListaCasos";
import { Header } from "@/components/ui/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tus casos</h1>
        <ListaCasos />
      </main>
    </>
  );
}
