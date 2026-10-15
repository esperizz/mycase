// PROTOTIPO — tres variantes de la hoja de ruta de ART, switcheables con ?variant=A|B|C.

import { Prototipo } from "./Prototipo";

export default async function PrototipoHojaRuta({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { variant } = await searchParams;
  const v = typeof variant === "string" && ["A", "B", "C"].includes(variant) ? variant : "A";
  return <Prototipo variante={v} />;
}
