"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";

// El foco se marca con el borde y el anillo del propio campo; se apaga el contorno global
// de :focus-visible para que no quede un doble contorno.
const control =
  "w-full rounded-control border border-secondary bg-surface-primary px-4 h-11 text-body-sm text-primary placeholder:text-tertiary focus:border-secondary-focus focus:outline-none focus:ring-1 focus:ring-focus focus-visible:outline-none";

interface CampoProps {
  label: string;
  opcional?: boolean;
  /** Explicación corta debajo del campo; los lectores de pantalla la leen junto con él. */
  ayuda?: React.ReactNode;
}

const idAyuda = (id: string, ayuda: React.ReactNode) => (ayuda ? `${id}-ayuda` : undefined);

function Campo({
  id,
  label,
  opcional,
  ayuda,
  children,
}: CampoProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label id={`${id}-label`} htmlFor={id} className="text-label text-primary">
        {label}
        {opcional && <span className="font-regular text-tertiary"> (opcional)</span>}
      </label>
      {children}
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-caption text-secondary">
          {ayuda}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  opcional,
  ayuda,
  ...input
}: CampoProps & React.ComponentProps<"input">) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional} ayuda={ayuda}>
      <input id={id} aria-describedby={idAyuda(id, ayuda)} className={control} {...input} />
    </Campo>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 text-secondary ${className}`} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Opcion {
  value: string;
  label: string;
}

/** Las opciones salen de los <option> hijos, así el uso es igual al de un <select>. */
function leerOpciones(children: React.ReactNode): Opcion[] {
  return Children.toArray(children).flatMap((hijo) => {
    if (!isValidElement<{ value?: string | number; children?: React.ReactNode }>(hijo)) return [];
    const { value, children: texto } = hijo.props;
    const label = Children.toArray(texto).join("");
    return [{ value: String(value ?? label), label }];
  });
}

/**
 * Selector. En celular es el <select> nativo (la rueda o la hoja del sistema son más cómodas
 * para el dedo); desde sm se reemplaza por una lista propia con el estilo de la app, porque la
 * lista desplegada del <select> la dibuja el navegador y no se puede estilizar.
 */
export function SelectField({
  label,
  opcional,
  children,
  value,
  onChange,
  ...select
}: CampoProps & React.ComponentProps<"select">) {
  const id = useId();
  const opciones = leerOpciones(children);
  const elegida = opciones.find((o) => o.value === String(value)) ?? opciones[0];

  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const elegir = (opcion: Opcion) => {
    // Mismo contrato que un <select>: quien lo usa lee e.target.value.
    onChange?.({ target: { value: opcion.value } } as unknown as React.ChangeEvent<HTMLSelectElement>);
    setAbierta(false);
    boton.current?.focus();
  };

  const abrir = () => {
    setActiva(Math.max(0, opciones.findIndex((o) => o.value === elegida?.value)));
    setAbierta(true);
  };

  useEffect(() => {
    if (!abierta) return;
    const fuera = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierta(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierta]);

  // Mantener visible la opción activa al moverse con el teclado.
  useEffect(() => {
    if (abierta) lista.current?.children[activa]?.scrollIntoView({ block: "nearest" });
  }, [abierta, activa]);

  const teclas = (e: React.KeyboardEvent) => {
    const ultimo = opciones.length - 1;
    if (!abierta) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        abrir();
      }
      return;
    }
    if (e.key === "ArrowDown") setActiva((i) => Math.min(ultimo, i + 1));
    else if (e.key === "ArrowUp") setActiva((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActiva(0);
    else if (e.key === "End") setActiva(ultimo);
    else if (e.key === "Enter" || e.key === " ") elegir(opciones[activa]);
    else if (e.key === "Tab") {
      setAbierta(false);
      return;
    } else if (e.key === "Escape") setAbierta(false);
    else if (e.key.length === 1) {
      // Escribir una letra salta a la primera opción que empieza con ella.
      const i = opciones.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActiva(i);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <Campo id={id} label={label} opcional={opcional}>
      {/* Celular: nativo. */}
      <div className="relative sm:hidden">
        <select id={id} value={value} onChange={onChange} className={`${control} appearance-none pr-10`} {...select}>
          {children}
        </select>
        <Chevron className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Desde sm: lista propia. */}
      <div ref={contenedor} className="relative hidden sm:block">
        <button
          ref={boton}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-haspopup="listbox"
          aria-expanded={abierta}
          aria-controls={`${id}-lista`}
          aria-activedescendant={abierta ? `${id}-op-${activa}` : undefined}
          onClick={() => (abierta ? setAbierta(false) : abrir())}
          onKeyDown={teclas}
          className={`${control} flex items-center justify-between gap-2 text-left`}
        >
          <span className="truncate">{elegida?.label}</span>
          <Chevron className={`shrink-0 transition-transform ${abierta ? "rotate-180" : ""}`} />
        </button>
        {abierta && (
          <ul
            ref={lista}
            id={`${id}-lista`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute left-0 right-0 top-12 z-30 max-h-64 overflow-auto rounded-control border border-secondary bg-surface-primary p-1 shadow-popover"
          >
            {opciones.map((o, i) => {
              const seleccionada = o.value === elegida?.value;
              return (
                <li
                  key={o.value}
                  id={`${id}-op-${i}`}
                  role="option"
                  aria-selected={seleccionada}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => elegir(o)}
                  onPointerMove={() => setActiva(i)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-option px-3 py-2 text-body-sm ${
                    i === activa ? "bg-surface-primary-hover" : ""
                  } ${seleccionada ? "font-semibold text-accent" : "text-primary"}`}
                >
                  {o.label}
                  {seleccionada && (
                    <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Campo>
  );
}

export function TextAreaField({
  label,
  opcional,
  ayuda,
  ...area
}: CampoProps & React.ComponentProps<"textarea">) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional} ayuda={ayuda}>
      <textarea
        id={id}
        aria-describedby={idAyuda(id, ayuda)}
        className={`${control} field-sizing-content h-auto min-h-24 py-2`}
        {...area}
      />
    </Campo>
  );
}
