"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { BotonTexto, Button, ButtonLink, Enlace, FilaEnlace, LinkVolver } from "@/components/ui/Button";
import { MuestrasDeColor, MuestrasDeRadio, MuestrasDeTexto } from "@/components/ui/Catalogo";
import { Casilla, Chip, Pestanias, Segmentado } from "@/components/ui/Controles";
import { Dato, Indicador, MarcadorPaso } from "@/components/ui/Datos";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { MenuAcciones } from "@/components/ui/MenuAcciones";
import { Pagina } from "@/components/ui/Pagina";
import { Aviso, ListaDividida, Recuadro, Tarjeta, TarjetaEnlace, Vacio } from "@/components/ui/Superficies";
import { Rotulo, Texto, Titulo, TituloTenue } from "@/components/ui/Texto";

/**
 * Catálogo del sistema de diseño: los tokens y cada componente de `components/ui` con sus
 * variantes. Sirve para ver de un vistazo qué hay antes de armar una pantalla nueva.
 */
export default function SistemaPage() {
  const [segmento, setSegmento] = useState<"plazo" | "tarea">("plazo");
  const [chip, setChip] = useState(true);
  const [pestania, setPestania] = useState<"uno" | "dos">("uno");
  const [tildada, setTildada] = useState(true);
  const [dialogo, setDialogo] = useState(false);

  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <Rotulo>MyCase</Rotulo>
        <Titulo>
          Sistema de diseño <TituloTenue>tokens y componentes</TituloTenue>
        </Titulo>
      </div>

      <Tarjeta titulo="Colores" ayuda="Definidos en app/globals.css con la nomenclatura color · elemento · parte · prioridad · estado. La paleta de Tailwind está apagada.">
        <MuestrasDeColor />
      </Tarjeta>

      <Tarjeta titulo="Radios">
        <MuestrasDeRadio />
      </Tarjeta>

      <Tarjeta titulo="Text styles" ayuda="Cada estilo define tamaño, interlineado, peso y tracking juntos.">
        <MuestrasDeTexto />
        <div className="flex flex-wrap gap-4">
          <Texto estilo="body-sm" peso="semibold" tono="danger">
            Vencido
          </Texto>
          <Texto estilo="body-sm" peso="semibold" tono="warning">
            Vence hoy
          </Texto>
          <Texto estilo="body-sm" peso="semibold" tono="success">
            Informado
          </Texto>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Botones y enlaces">
        <div className="flex flex-wrap gap-3">
          <Button>Principal</Button>
          <Button variante="secondary">Secundario</Button>
          <Button variante="danger">Borrar</Button>
          <Button variante="success">Mandar por WhatsApp</Button>
          <ButtonLink href="/sistema" flecha>
            Con flecha
          </ButtonLink>
          <Button disabled>Deshabilitado</Button>
        </div>
        <Button variante="secondary" className="self-start" onClick={() => setDialogo(true)}>
          Abrir diálogo de confirmación
        </Button>
        <DialogoConfirmar
          abierto={dialogo}
          titulo="¿Borrar esta nota?"
          textoConfirmar="Borrar nota"
          peligro
          onCancelar={() => setDialogo(false)}
          onConfirmar={() => setDialogo(false)}
        >
          <p>No se puede deshacer.</p>
        </DialogoConfirmar>
        <div className="flex flex-wrap items-center gap-4">
          <BotonTexto estilo="body-sm">+ Acción fuerte</BotonTexto>
          <Enlace href="/sistema" variante="subtle" estilo="body-sm">
            Nombre que lleva a su ficha
          </Enlace>
          <BotonTexto variante="quiet" estilo="body-sm">
            Cancelar
          </BotonTexto>
          <BotonTexto variante="danger" estilo="body-sm">
            Eliminar
          </BotonTexto>
          <BotonTexto variante="dangerQuiet" estilo="caption">
            Descartar
          </BotonTexto>
          <LinkVolver href="/sistema">Volver</LinkVolver>
          <MenuAcciones etiqueta="Acciones de ejemplo" acciones={[{ etiqueta: "Editar", onClick: () => {} }, { etiqueta: "Quitar", onClick: () => {}, peligro: true }]} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutro</Badge>
          <Badge tono="accent">Acento</Badge>
          <Badge tono="info">Info</Badge>
          <Badge tono="success">Éxito</Badge>
          <Badge tono="warning">Alerta</Badge>
          <Badge tono="danger">Peligro</Badge>
          <Badge tono="special">Especial</Badge>
          <Badge tono="art">ART</Badge>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Avisos y recuadros">
        <Aviso tono="info">Sugerencia o explicación.</Aviso>
        <Aviso tono="success">Listo: se guardó.</Aviso>
        <Aviso tono="warning">Ojo con esto antes de seguir.</Aviso>
        <Aviso tono="danger">No pudimos guardar el cambio.</Aviso>
        <Recuadro>Recuadro neutro, para un ítem dentro de una tarjeta.</Recuadro>
        <Recuadro tono="highlighted">Recuadro destacado: lo que se está haciendo ahora.</Recuadro>
        <Recuadro centrado>
          <Texto estilo="body-sm" tono="secondary">
            Recuadro centrado, para una lista vacía.
          </Texto>
        </Recuadro>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Campos" ayuda="Con label, opcional y ayuda.">
          <TextField label="Nombre del cliente" placeholder="Ej.: Marta Ríos" />
          <TextField label="Expediente" opcional ayuda="Como figura en el juzgado." />
          <SelectField label="Tipo de reclamo" value="despido" onChange={() => {}}>
            <option value="despido">Despido</option>
            <option value="art">Accidente (ART)</option>
          </SelectField>
          <TextAreaField label="Nota" opcional />
        </Tarjeta>

        <Tarjeta titulo="Controles">
          <Segmentado
            label="Tipo"
            opciones={[
              { valor: "plazo", etiqueta: "Plazo" },
              { valor: "tarea", etiqueta: "Tarea" },
            ]}
            valor={segmento}
            onChange={setSegmento}
            ayuda="Elegir entre pocas opciones a la vista."
          />
          <div className="flex flex-wrap gap-2">
            <Chip activo={chip} onClick={() => setChip(!chip)}>
              Chip activo
            </Chip>
            <Chip activo={!chip} onClick={() => setChip(!chip)}>
              Chip
            </Chip>
          </div>
          <Casilla etiqueta="Casilla con etiqueta" checked={tildada} onChange={(e) => setTildada(e.target.checked)} />
          <Pestanias
            etiqueta="Ejemplo"
            opciones={[
              { valor: "uno", etiqueta: "Activos", cantidad: 3 },
              { valor: "dos", etiqueta: "Cerrados", cantidad: 1 },
            ]}
            valor={pestania}
            onChange={setPestania}
          >
            <Texto estilo="body-sm" tono="secondary">
              Contenido de la pestaña {pestania === "uno" ? "Activos" : "Cerrados"}.
            </Texto>
          </Pestanias>
        </Tarjeta>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Datos">
          <div className="grid grid-cols-2 gap-4">
            <Dato label="Empleador" valor="Acme SA" />
            <Dato label="Caso abierto el" valor="3 de oct de 2026" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Indicador etiqueta="Próximo plazo" valor="en 4 días" detalle="Contestar traslado" href="/sistema" tono="accent" />
            <Indicador etiqueta="Próximo plazo" valor="vencido" detalle="Apelar" href="/sistema" tono="danger" />
          </div>
          <ListaDividida as="ol">
            {(["cumplido", "actual", "pendiente"] as const).map((e) => (
              <li key={e} className="flex items-start gap-3 py-3">
                <MarcadorPaso estado={e} />
                <Texto estilo="body-sm" tono="primary">
                  Paso {e}
                </Texto>
              </li>
            ))}
          </ListaDividida>
        </Tarjeta>

        <Tarjeta titulo="Listas y estados vacíos" destacada>
          <FilaEnlace href="/sistema" accion="Ver">
            <Texto as="span" peso="medium" tono="primary">
              Fila que lleva a algún lado
            </Texto>
          </FilaEnlace>
          <TarjetaEnlace href="/sistema" className="flex items-center justify-between gap-3">
            <Texto peso="semibold" tono="primary">
              Tarjeta que es un link
            </Texto>
            <Badge tono="info">Intimación</Badge>
          </TarjetaEnlace>
          <Vacio descripcion="No hay nada en esta lista." />
        </Tarjeta>
      </div>

      <Vacio titulo="Estado vacío de pantalla" descripcion="Explica qué va a aparecer acá y cómo empezar.">
        <Button>Empezar</Button>
      </Vacio>
    </Pagina>
  );
}
