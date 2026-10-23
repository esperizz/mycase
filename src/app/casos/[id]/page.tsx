"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CartasCaso } from "@/components/casos/CartasCaso";
import { DialogoCerrarCaso } from "@/components/casos/CerrarCaso";
import { DocumentosCaso } from "@/components/casos/DocumentosCaso";
import { EtapaBadge } from "@/components/casos/EstadoBadge";
import { FormularioCaso } from "@/components/casos/FormularioCaso";
import { FormularioVencimiento } from "@/components/casos/FormularioVencimiento";
import { HojaRutaArt } from "@/components/casos/HojaRutaArt";
import { InformarCliente } from "@/components/casos/InformarCliente";
import { ItemVencimiento } from "@/components/casos/ItemVencimiento";
import { NotasCaso } from "@/components/casos/NotasCaso";
import { BotonTexto, Button, FilaEnlace, LinkVolver } from "@/components/ui/Button";
import { Dato } from "@/components/ui/Datos";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { SelectField } from "@/components/ui/Field";
import { Pagina, PaginaNoEncontrada } from "@/components/ui/Pagina";
import { Tarjeta } from "@/components/ui/Superficies";
import { Texto, Titulo, TituloTenue } from "@/components/ui/Texto";
import { useCasos } from "@/lib/casos/CasosProvider";
import { otrosCasos } from "@/lib/casos/clientes";
import { formatearFecha } from "@/lib/casos/formato";
import { esArt, etapaArt } from "@/lib/casos/hojaRuta";
import { ESTADO_LABEL, ESTADOS } from "@/lib/casos/tipos";

export default function FichaCasoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { casos, listo, actualizar, eliminar, agregarVencimiento } = useCasos();
  const caso = casos.find((c) => c.id === id);

  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  if (!listo) return null;

  if (!caso) return <PaginaNoEncontrada titulo="No encontramos ese caso" href="/casos" enlace="Volver a la lista" />;

  const art = esArt(caso);
  const otros = otrosCasos(caso, casos);

  const borrarCaso = () => {
    eliminar(caso.id);
    router.push("/casos");
  };

  return (
    <Pagina ancho="medio">
      <div className="flex flex-col gap-3">
        <LinkVolver href="/casos">Volver a mis casos</LinkVolver>
        <div className="flex flex-wrap items-center gap-3">
          <Titulo>
            {caso.cliente} <TituloTenue>contra {caso.empleador}</TituloTenue>
          </Titulo>
          <EtapaBadge caso={caso} />
        </div>
      </div>

      {art ? <HojaRutaArt caso={caso} /> : <CartasCaso caso={caso} />}

      {editando ? (
        <Tarjeta>
          <FormularioCaso
            inicial={caso}
            textoBoton="Guardar cambios"
            onGuardar={(datos) => {
              actualizar(caso.id, (c) => ({ ...c, ...datos }));
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        </Tarjeta>
      ) : (
        <Tarjeta>
          <div className="grid grid-cols-2 gap-4">
            <Dato label="Empleador" valor={caso.empleador} />
            <Dato label="Tipo de reclamo" valor={caso.tipoReclamo} />
            <Dato label="Contacto" valor={caso.contacto || "—"} />
            <Dato label="Caso abierto el" valor={formatearFecha(caso.fechaApertura)} />
            {caso.expediente && <Dato label="Expediente" valor={caso.expediente} />}
            {caso.juzgado && <Dato label="Juzgado" valor={caso.juzgado} />}
          </div>
          <Button variante="secondary" className="self-start" onClick={() => setEditando(true)}>
            Editar datos
          </Button>
        </Tarjeta>
      )}

      {otros.length > 0 && (
        <Tarjeta titulo={`Otros casos de ${caso.cliente}`}>
          <ul className="flex flex-col gap-2">
            {otros.map((o) => (
              <li key={o.id}>
                <FilaEnlace href={`/casos/${o.id}`}>
                  <Texto as="span" peso="medium" tono="primary">
                    {o.tipoReclamo}{" "}
                    <Texto as="span" peso="regular" tono="secondary">
                      · contra {o.empleador}
                    </Texto>
                  </Texto>
                  <EtapaBadge caso={o} />
                </FilaEnlace>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta titulo="Estado del caso">
        {art ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Texto estilo="body-sm" tono="secondary">
              {caso.estado === "cerrado" ? "Caso cerrado." : `Etapa: ${etapaArt(caso)}. Avanza sola con la hoja de ruta.`}
            </Texto>
            <Button
              variante="secondary"
              onClick={() =>
                caso.estado === "cerrado"
                  ? actualizar(caso.id, (c) => ({ ...c, estado: "consulta" }))
                  : setCerrando(true)
              }
            >
              {caso.estado === "cerrado" ? "Reabrir caso" : "Cerrar caso"}
            </Button>
          </div>
        ) : (
          <SelectField
            label="Etapa actual"
            value={caso.estado}
            onChange={(e) => {
              const estado = e.target.value as typeof caso.estado;
              // Cerrar pide confirmación; el resto de las etapas cambia directo.
              if (estado === "cerrado") setCerrando(true);
              else actualizar(caso.id, (c) => ({ ...c, estado }));
            }}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </SelectField>
        )}
        {/* En ART no: la hoja de ruta ya arma el mensaje de cada paso. */}
        {!art && caso.estado !== "cerrado" && <InformarCliente caso={caso} />}
      </Tarjeta>

      <Tarjeta titulo="Plazos y tareas">
        {caso.vencimientos.length === 0 ? (
          <Texto estilo="body-sm" tono="secondary">
            No hay plazos ni tareas cargados para este caso.
          </Texto>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...caso.vencimientos]
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map((v) => (
                <ItemVencimiento key={v.id} casoId={caso.id} vencimiento={v} />
              ))}
          </ul>
        )}
        <FormularioVencimiento textoBoton="Agregar" onGuardar={(datos) => agregarVencimiento(caso.id, datos)} />
      </Tarjeta>

      <NotasCaso caso={caso} />

      <DocumentosCaso caso={caso} />

      <BotonTexto variante="danger" estilo="body-sm" className="self-start" onClick={() => setBorrando(true)}>
        Eliminar este caso
      </BotonTexto>

      <DialogoCerrarCaso caso={caso} abierto={cerrando} onCerrar={() => setCerrando(false)} />

      <DialogoConfirmar
        abierto={borrando}
        titulo={`¿Eliminar el caso de ${caso.cliente}?`}
        textoConfirmar="Eliminar caso"
        peligro
        onCancelar={() => setBorrando(false)}
        onConfirmar={borrarCaso}
      >
        <p>Se borran sus datos, plazos y tareas, notas, documentos, cartas y hoja de ruta. No se puede deshacer.</p>
      </DialogoConfirmar>
    </Pagina>
  );
}
