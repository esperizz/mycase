import { Enlace } from "./Button";
import { Header } from "./Header";
import { Texto, unir } from "./Texto";

type Ancho = "angosto" | "medio" | "amplio" | "completo";

/** Angosto para formularios, medio para fichas, amplio para textos largos, completo para listas. */
const ANCHOS: Record<Ancho, string> = {
  angosto: "max-w-xl",
  medio: "max-w-2xl",
  amplio: "max-w-3xl",
  completo: "max-w-5xl",
};

/** Estructura de cada pantalla: el header y el contenido centrado con su ancho. */
export function Pagina({
  ancho = "completo",
  centrada = false,
  encabezado = true,
  children,
}: {
  ancho?: Ancho;
  /** Contenido corto en el medio de la pantalla (login, "no encontramos"). */
  centrada?: boolean;
  encabezado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {encabezado && <Header />}
      <main
        className={unir(
          "mx-auto flex w-full flex-1 flex-col px-4",
          centrada ? "items-center justify-center gap-4 py-16 text-center" : "gap-8 py-8",
          ANCHOS[ancho],
        )}
      >
        {children}
      </main>
    </>
  );
}

/** Para un link a algo que no existe (o ya se borró). */
export function PaginaNoEncontrada({ titulo, href, enlace }: { titulo: string; href: string; enlace: string }) {
  return (
    <Pagina ancho="angosto" centrada>
      <Texto estilo="h2" tono="primary">
        {titulo}
      </Texto>
      <Enlace href={href} estilo="body-sm" subrayado>
        {enlace}
      </Enlace>
    </Pagina>
  );
}
