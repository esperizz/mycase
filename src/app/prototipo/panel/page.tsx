// PROTOTIPO — tres variantes de las tarjetas de arriba del panel, switcheables con ?variant=A|B|C.

import { Prototipo } from "./Prototipo";

export default async function PrototipoPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { variant, datos } = await searchParams;
  const v = typeof variant === "string" && ["A", "B", "C"].includes(variant) ? variant : "A";
  return <Prototipo variante={v} muchos={datos === "muchos"} />;
}
