import { CopiaSeguridad } from "@/components/casos/CopiaSeguridad";
import { ListaCasos } from "@/components/casos/ListaCasos";
import { Pagina } from "@/components/ui/Pagina";
import { Titulo } from "@/components/ui/Texto";

export default function CasosPage() {
  return (
    <Pagina>
      <Titulo>Tus casos</Titulo>
      <ListaCasos />
      <CopiaSeguridad />
    </Pagina>
  );
}
