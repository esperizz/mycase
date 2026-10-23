"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BotonTexto, Button } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { Aviso, ListaDividida, Tarjeta } from "@/components/ui/Superficies";
import { Texto } from "@/components/ui/Texto";
import {
  BUCKET,
  carpetaDelCaso,
  formatearTamanio,
  nombreVisible,
  rutaDocumento,
  TAMANIO_MAXIMO,
} from "@/lib/casos/documentos";
import { formatearFecha } from "@/lib/casos/formato";
import { createClient } from "@/lib/supabase/client";
import type { Caso } from "@/lib/casos/tipos";

interface Documento {
  /** Nombre del archivo dentro de la carpeta del caso. */
  archivo: string;
  ruta: string;
  fecha: string;
  tamanio: number;
}

/** Documentos del caso (DNI, recibos, historia clínica…), guardados en un almacenamiento privado. */
export function DocumentosCaso({ caso }: { caso: Caso }) {
  const [supabase] = useState(createClient);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[] | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [borrando, setBorrando] = useState<Documento | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const cargar = useCallback(
    async (uid: string) => {
      const carpeta = carpetaDelCaso(uid, caso.id);
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(carpeta, { sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        setError("No pudimos cargar los documentos. Probá recargar la página.");
        setDocumentos([]);
        return;
      }
      setDocumentos(
        (data ?? [])
          .filter((o) => o.id) // las carpetas vienen sin id
          .map((o) => ({
            archivo: o.name,
            ruta: `${carpeta}/${o.name}`,
            fecha: (o.created_at ?? "").slice(0, 10),
            tamanio: (o.metadata?.size as number | undefined) ?? 0,
          })),
      );
    },
    [supabase, caso.id],
  );

  useEffect(() => {
    let vigente = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!vigente || !data.user) return;
      setUsuario(data.user.id);
      await cargar(data.user.id);
    })();
    return () => {
      vigente = false;
    };
  }, [supabase, cargar]);

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!usuario || archivos.length === 0) return;
    const grandes = archivos.filter((a) => a.size > TAMANIO_MAXIMO);
    const validos = archivos.filter((a) => a.size <= TAMANIO_MAXIMO);
    setError(
      grandes.length
        ? `No se subió ${grandes.map((a) => `“${a.name}”`).join(", ")}: el máximo es ${formatearTamanio(TAMANIO_MAXIMO)} por archivo.`
        : "",
    );
    if (validos.length === 0) return;
    setSubiendo(true);
    const resultados = await Promise.all(
      validos.map((a) =>
        supabase.storage
          .from(BUCKET)
          .upload(rutaDocumento(usuario, caso.id, crypto.randomUUID(), a.name), a, { contentType: a.type || undefined }),
      ),
    );
    setSubiendo(false);
    if (resultados.some((r) => r.error)) setError("Algún archivo no se pudo subir. Revisá tu conexión y probá de nuevo.");
    await cargar(usuario);
  };

  const abrir = async (doc: Documento) => {
    // Se abre la pestaña antes de pedir el link, para que el navegador no la bloquee.
    const pestania = window.open("", "_blank");
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.ruta, 60);
    if (error || !data) {
      pestania?.close();
      setError("No pudimos abrir el documento.");
      return;
    }
    if (pestania) pestania.location.href = data.signedUrl;
    else window.location.assign(data.signedUrl);
  };

  const borrar = async () => {
    if (!borrando || !usuario) return;
    const { error } = await supabase.storage.from(BUCKET).remove([borrando.ruta]);
    setBorrando(null);
    if (error) setError("No pudimos borrar el documento.");
    await cargar(usuario);
  };

  return (
    <Tarjeta
      titulo="Documentos"
      ayuda="DNI, recibos, historia clínica, cartas. Se guardan en un espacio privado: solo los ves vos."
      accion={
        <Button
          variante="secondary"
          className="self-start"
          disabled={!usuario || subiendo}
          onClick={() => input.current?.click()}
        >
          {subiendo ? "Subiendo…" : "+ Subir archivos"}
        </Button>
      }
    >
      <input ref={input} type="file" multiple className="hidden" onChange={subir} />

      {error && (
        <Aviso tono="danger" role="alert">
          {error}
        </Aviso>
      )}

      {documentos === null ? (
        <Texto estilo="body-sm" tono="tertiary">
          Cargando…
        </Texto>
      ) : documentos.length === 0 ? (
        <Texto estilo="body-sm" tono="secondary">
          Todavía no hay documentos en este caso.
        </Texto>
      ) : (
        <ListaDividida>
          {documentos.map((d) => (
            <li key={d.ruta} className="flex items-center gap-3 py-2">
              <BotonTexto variante="subtle" estilo="body-sm" className="min-w-0 flex-1 truncate text-left" onClick={() => abrir(d)}>
                {nombreVisible(d.archivo)}
              </BotonTexto>
              <Texto as="span" estilo="caption" tono="secondary" className="shrink-0">
                {d.fecha && formatearFecha(d.fecha)} · {formatearTamanio(d.tamanio)}
              </Texto>
              <BotonTexto variante="dangerQuiet" estilo="caption" className="shrink-0" onClick={() => setBorrando(d)}>
                Borrar
              </BotonTexto>
            </li>
          ))}
        </ListaDividida>
      )}

      <DialogoConfirmar
        abierto={!!borrando}
        titulo={`¿Borrar “${borrando ? nombreVisible(borrando.archivo) : ""}”?`}
        textoConfirmar="Borrar documento"
        peligro
        onCancelar={() => setBorrando(null)}
        onConfirmar={borrar}
      >
        <p>Se borra para siempre. No se puede deshacer.</p>
      </DialogoConfirmar>
    </Tarjeta>
  );
}
