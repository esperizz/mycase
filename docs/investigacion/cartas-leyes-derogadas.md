# Cartas de intimación: leyes derogadas

- **Fecha:** 20 de octubre de 2026
- **Estado:** arreglo mínimo hecho en la app. **Falta que lo revise una abogada.**

## Qué pasaba

La carta que arma MyCase citaba normas que la Ley 27.742 (Ley Bases, 2024) derogó:

- El art. 99 deroga los arts. 8 a 17 de la Ley 24.013 (multas por trabajo no registrado, incluida la intimación del art. 11).
- El art. 100 deroga entera la Ley 25.323 (incremento indemnizatorio).

Fuentes:

- [Ley Bases: la reciente respuesta de la Justicia a la derogación de las sanciones e indemnizaciones agravadas laborales](https://abogados.com.ar/ley-bases-la-reciente-respuesta-de-la-justicia-a-la-derogacion-de-las-sanciones-e-indemnizaciones-agravadas-laborales/35525) (abogados.com.ar)
- [Ley 27.742: derogación de sanciones pecuniarias en materia laboral y aplicación de la ley más benigna](https://aldiaargentina.microjuris.com/2026/10/02/doctrina-ley-27-742-derogacion-de-sanciones-pecuniarias-en-materia-laboral-y-aplicacion-de-la-ley-mas-benigna-divergencia-interpretativa-de-los-superiores-tribunales-provinciales/) (Microjuris, 02/10/2026)

Los tribunales no coinciden en si la derogación alcanza a relaciones o juicios anteriores a la ley: el STJ de Jujuy («Rodríguez», 2026) aplicó la ley más benigna, mientras que el TSJ de Córdoba («Moyano») sostuvo la irretroactividad. Para despidos de hoy, esas multas ya no existen.

## Qué se cambió (solo se sacó, no se agregó texto legal nuevo)

En `src/lib/casos/cartaCatalogo.ts`:

| Dónde | Antes | Ahora |
|---|---|---|
| Despido sin causa · base | "…Ley de Contrato de Trabajo (Ley 20.744) y la Ley 25.323" | "…Ley de Contrato de Trabajo (Ley 20.744)" |
| Trabajo no registrado · base | "…Ley 24.013 de Empleo" | "…Ley de Contrato de Trabajo (Ley 20.744)" |
| Consecuencia | "Reclamar el incremento de la Ley 25.323" | eliminada |
| Consecuencia | "Reclamar las multas de la Ley 24.013" | eliminada |

Las cartas ya guardadas que tenían tildada una consecuencia eliminada simplemente dejan de mostrar esa línea.

## Para preguntarle a una abogada

1. ¿Está bien citar la LCT como base de la intimación por trabajo no registrado, o conviene otra norma (por ejemplo, el art. 52 LCT)?
2. ¿Hay que sumar alguna consecuencia que reemplace a las multas? Las fuentes mencionan que sigue abierta la vía de reclamar daños (reparación integral), que la app ya ofrece como "Reclamar además los daños".
3. Para casos anteriores a julio de 2024, ¿conviene ofrecer igual las multas como opción, avisando que su aplicación es discutida?
4. Los plazos que ofrece la carta (48 horas, 5 y 10 días hábiles), ¿son los que usan en la práctica para cada tipo de reclamo?
