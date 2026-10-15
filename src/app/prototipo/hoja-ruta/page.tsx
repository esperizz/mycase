// PROTOTIPO — tres variantes de la hoja de ruta de ART, switcheables con ?variant=A|B|C.

import { Prototipo } from "./Prototipo";

export default async function PrototipoHojaRuta({ searchParams }: PageProps<"/prototipo/hoja-ruta">) {
  const { variant } = await searchParams;
  const v = typeof variant === "string" && ["A", "B", "C"].includes(variant) ? variant : "A";
  return <Prototipo variante={v} />;
}
