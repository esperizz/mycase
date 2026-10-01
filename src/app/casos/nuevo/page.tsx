import { FormularioNuevoCaso } from "@/components/casos/FormularioNuevoCaso";
import { Header } from "@/components/ui/Header";

export default function NuevoCasoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cargar un caso nuevo</h1>
        <FormularioNuevoCaso />
      </main>
    </>
  );
}
