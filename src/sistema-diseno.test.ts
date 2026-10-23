import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Controla que la interfaz no se salga del sistema de diseño (`app/globals.css`):
 * 1. En ningún lado se usan colores, radios, sombras ni tipografía por fuera de los tokens, ni valores
 *    arbitrarios (`w-[13px]`) ni estilos en línea.
 * 2. Fuera de `components/ui`, las clases solo acomodan (flex, grid, márgenes, anchos): todo lo
 *    que se ve (color, tipografía, bordes, fondos) lo ponen los componentes de `ui`.
 */

const SRC = fileURLToPath(new URL(".", import.meta.url));
const UI = join(SRC, "components", "ui");

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return ruta.endsWith(".tsx") ? [ruta] : [];
  });
}

const TODOS = archivos(SRC);
const FUERA_DE_UI = TODOS.filter((r) => !r.startsWith(UI + sep));
const nombre = (ruta: string) => relative(SRC, ruta);

/** Textos entre comillas del archivo (incluye los de adentro de los template literals). */
function literales(fuente: string): string[] {
  const textos: string[] = [];
  for (const m of fuente.matchAll(/`([^`]*)`|"([^"\n]*)"|'([^'\n]*)'/g)) {
    if (m[1] === undefined) {
      textos.push(m[2] ?? m[3]);
      continue;
    }
    textos.push(m[1].replace(/\$\{[^}]*\}/g, " "));
    for (const interno of m[1].matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)) textos.push(interno[1] ?? interno[2]);
  }
  return textos;
}

/** Clases que se pasan en `className`, también las que se eligen con un ternario. */
function clasesDeClassName(fuente: string): string[] {
  const clases: string[] = [];
  for (const m of fuente.matchAll(/className=/g)) {
    const inicio = m.index + m[0].length;
    let valor = "";
    if (fuente[inicio] === '"') {
      valor = fuente.slice(inicio, fuente.indexOf('"', inicio + 1) + 1);
    } else if (fuente[inicio] === "{") {
      let profundidad = 0;
      let fin = inicio;
      for (; fin < fuente.length; fin++) {
        if (fuente[fin] === "{") profundidad++;
        else if (fuente[fin] === "}" && --profundidad === 0) break;
      }
      valor = fuente.slice(inicio, fin + 1);
    }
    for (const texto of literales(valor)) clases.push(...texto.split(/\s+/).filter(Boolean));
  }
  return clases;
}

const PALETA_TAILWIND =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const PROHIBIDO_EN_TODOS: [string, RegExp][] = [
  ["color de la paleta de Tailwind", new RegExp(`(?:^|[\\s"'\`:])[a-z-]+-(?:${PALETA_TAILWIND})-\\d{2,3}\\b`, "m")],
  ["blanco o negro sin token", /(?:^|[\s"'`:])(?:text|bg|border|ring|divide|fill|stroke|outline|accent|placeholder)-(?:white|black)\b/m],
  ["radio o sombra de la escala de Tailwind", /(?:^|[\s"'`:])(?:rounded(?:-[trblse]{1,2})?|shadow)-(?:xs|sm|md|lg|xl|2xl|3xl)\b/m],
  ["valor arbitrario", /(?:^|[\s"'`:])-?[a-z][a-z0-9-]*-\[[^\]\s]*\]/m],
  [
    "tipografía fuera de los text styles",
    /(?:^|[\s"'`:])(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|font-(?:thin|extralight|light|normal|bold|extrabold|black)|tracking-[a-z]+|leading-[a-z0-9]+)(?![\w-])/m,
  ],
  ["estilo en línea", /\bstyle=\{\{/],
];

describe("sistema de diseño", () => {
  it("globals.css apaga los valores por defecto de Tailwind", () => {
    const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
    expect(css).toContain("--color-*: initial;");
    expect(css).toContain("--radius-*: initial;");
    expect(css).toContain("--shadow-*: initial;");
    expect(css).toContain("--text-*: initial;");
    expect(css).toContain("--font-weight-*: initial;");
    expect(css).toContain("--tracking-*: initial;");
    expect(css).toContain("--leading-*: initial;");
  });

  it("los tokens de color siguen la nomenclatura y todos llegan a Tailwind", () => {
    const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
    const raiz = css.slice(css.indexOf(":root {"), css.indexOf("@theme inline {"));
    const tokens = [...raiz.matchAll(/(--color-[a-z-]+):/g)].map((m) => m[1]);
    expect(tokens.length).toBeGreaterThan(0);

    // color-[elemento]-[parte]-[prioridad]-[estado], en inglés.
    const NOMENCLATURA =
      /^--color-(?:bg-(?:default|overlay|(?:surface|fill)-[a-z]+(?:-[a-z]+)?)|text-[a-z]+(?:-[a-z]+)?|border-[a-z]+(?:-[a-z]+)?)$/;
    const ESTADOS_O_VARIANTES = new Set(["hover", "focus", "disabled", "subtle", "fill"]);
    const malNombrados = tokens.filter((t) => {
      if (!NOMENCLATURA.test(t)) return true;
      const partes = t.replace(/^--color-(?:bg-(?:surface|fill)|text|border|bg)-?/, "").split("-");
      return partes.length > 1 && !ESTADOS_O_VARIANTES.has(partes[partes.length - 1]);
    });
    expect(malNombrados).toEqual([]);

    const tema = css.slice(css.indexOf("@theme inline {"));
    const sinMapear = tokens.filter((t) => !tema.includes(`var(${t})`));
    expect(sinMapear).toEqual([]);
  });

  it("los text styles siguen typography-[estilo]-[propiedad] y todos llegan a Tailwind", () => {
    const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
    const raiz = css.slice(css.indexOf(":root {"), css.indexOf("@theme inline {"));
    const tokens = [...new Set([...raiz.matchAll(/(--typography-[a-z0-9-]+):/g)].map((m) => m[1]))];
    expect(tokens.length).toBeGreaterThan(0);

    const NOMENCLATURA = /^--typography-(?:[a-z0-9]+(?:-sm)?-(?:size|line-height|letter-spacing|weight)|weight-[a-z]+)$/;
    expect(tokens.filter((t) => !NOMENCLATURA.test(t))).toEqual([]);

    const tema = css.slice(css.indexOf("@theme inline {"));
    expect(tokens.filter((t) => !tema.includes(`var(${t})`))).toEqual([]);
  });

  it.each(TODOS.map((r) => [nombre(r), r]))("%s usa solo tokens", (_, ruta) => {
    const fuente = readFileSync(ruta, "utf8");
    const problemas = PROHIBIDO_EN_TODOS.filter(([, re]) => re.test(fuente)).map(
      ([motivo, re]) => `${motivo}: ${fuente.match(re)?.[0].trim()}`,
    );
    expect(problemas).toEqual([]);
  });

  // Fuera de ui, una clase solo puede acomodar: ni color, ni tipografía, ni bordes, ni fondos.
  const LAYOUT = new RegExp(
    "^(?:(?:xs|sm|md|lg|xl|2xl):)*-?(?:" +
      [
        "(?:inline-)?(?:flex|grid|block)|inline|hidden|contents|sr-only",
        "flex-(?:row|col)(?:-reverse)?|flex-(?:wrap|nowrap|1|auto|none|initial)",
        "(?:shrink|grow)(?:-0)?|basis-\\S+",
        "(?:items|justify|self|content|place-items|place-content|place-self)-\\S+",
        "gap(?:-[xy])?-\\S+",
        "grid-(?:cols|rows)-\\d+|(?:col|row)-(?:span-\\d+|span-full|start-\\d+|end-\\d+)|grid-flow-\\S+|auto-(?:cols|rows)-\\S+",
        "[pm][trblxyse]?-\\S+|space-[xy]-\\S+",
        "(?:min-|max-)?[wh]-\\S+|size-\\S+",
        "relative|absolute|fixed|sticky|static|(?:inset(?:-[xy])?|top|right|bottom|left)-\\S+|z-\\S+",
        "overflow(?:-[xy])?-\\S+|truncate|scroll-mt-\\S+",
        "text-(?:left|center|right)|align-(?:middle|top|bottom|baseline)",
        "order-\\S+",
      ].join("|") +
      ")$",
  );

  // Cualquier texto que parezca una clase visual, aunque no esté en un className (por ejemplo,
  // una constante con clases que después se pasa a un componente).
  const VISUAL =
    /^(?:[a-z0-9]+:)*-?(?:bg-|text-(?!left$|center$|right$)|border|rounded|shadow|font-|tracking-|leading-|ring|divide-|underline|line-through|uppercase|opacity-|outline-|accent-|decoration-)/;

  it.each(FUERA_DE_UI.map((r) => [nombre(r), r]))("%s arma la pantalla con componentes de ui", (_, ruta) => {
    const fuente = readFileSync(ruta, "utf8");
    const fueraDeLayout = clasesDeClassName(fuente).filter((c) => !LAYOUT.test(c));
    const visuales = literales(fuente)
      .flatMap((t) => t.split(/\s+/))
      .filter((c) => VISUAL.test(c));
    expect([...new Set([...fueraDeLayout, ...visuales])]).toEqual([]);
  });
});
