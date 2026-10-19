"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
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
    <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-tinta">Documentos</h2>
          <p className="text-sm text-gray-500">
            DNI, recibos, historia clínica, cartas. Se guardan en un espacio privado: solo los ves vos.
          </p>
        </div>
        <Button
          variante="secondary"
          className="self-start"
          disabled={!usuario || subiendo}
          onClick={() => input.current?.click()}
        >
          {subiendo ? "Subiendo…" : "+ Subir archivos"}
        </Button>
        <input ref={input} type="file" multiple className="hidden" onChange={subir} />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {documentos === null ? (
        <p className="text-sm text-gray-400">Cargando…</p>
      ) : documentos.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay documentos en este caso.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {documentos.map((d) => (
            <li key={d.ruta} className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => abrir(d)}
                className="min-w-0 flex-1 truncate text-left text-sm font-medium text-tinta underline-offset-2 hover:underline"
              >
                {nombreVisible(d.archivo)}
              </button>
              <span className="shrink-0 text-xs text-gray-500">
                {d.fecha && formatearFecha(d.fecha)} · {formatearTamanio(d.tamanio)}
              </span>
              <button
                type="button"
                onClick={() => setBorrando(d)}
                className="shrink-0 text-xs text-gray-500 hover:text-red-700 hover:underline"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
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
    </section>
  );
}
