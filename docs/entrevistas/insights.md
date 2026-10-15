# Insights de las entrevistas

Portal de seguimiento de casos · Proyecto de portfolio UX/UI

- **Entrevistas:** [Abogada 1](abogada-1.md) (29/09/2026) y [Abogada 2](abogada-2.md) (30/09/2026)
- **Perfil de las entrevistadas:** abogadas laboralistas que trabajan de forma independiente o con colegas, con casos laborales, reclamos ante ART y algunos civiles.
- **Tablero de definición:** [FigJam](https://www.figma.com/board/0EBxNfPG51cFRAz8WzBnqH)

## Resumen

La hipótesis inicial era que los abogados querían un portal para que sus clientes vieran el estado de su caso sin tener que preguntar, y así reducir las consultas repetidas. **Las entrevistas no la sostienen tal como estaba:** los abogados quieren controlar qué información recibe el cliente, y ninguna confirmó que las consultas de estado les quiten mucho tiempo.

Aparece en cambio una dirección más prometedora: en los casos de ART el proceso es muy predecible, y anticiparle al cliente lo que va a pasar le da credibilidad al abogado. El producto se reenfoca de **"transparencia para el cliente"** a **"credibilidad y manejo de expectativas para el abogado"**.

---

## Lo que se confirma

| Hallazgo | Evidencia |
|---|---|
| Todo pasa por WhatsApp: consultas, documentos y avisos | Las dos. "Todo por mensajes de WhatsApp" (A1) |
| El abogado quiere controlar qué ve el cliente | "El cliente no debe ver todo, porque [...] se puede ir con otro" (A1). No le informa el monto final de la liquidación (A2) |
| Solo usarían algo si actualizar es casi instantáneo | "Botón, porque a veces somos vagos" (A1). "Si me genera más trabajo del que me resuelve [...] dejaría de utilizarla" (A2) |
| El aviso de estado tiene siempre la misma estructura | "Le explico en qué etapa se encuentra, qué se hizo hasta ese momento y cuál es el próximo paso" (A2) |
| Los clientes no entienden el lenguaje técnico | A1 responde "presentamos pronto despacho [...] debe resolver la comisión médica" y termina en una llamada |
| Hay consultas de estado frecuentes | "Por lo menos dos al día" (A1). A2 no dio el dato |

## Lo que se cae

| Hipótesis original | Qué encontramos |
|---|---|
| Informar más al cliente es mejor para todos | "A veces informarle tanto al cliente es una desventaja. Yo prefiero no informarle nada y que ellos me pregunten" (A2) |
| Las consultas de estado le quitan mucho tiempo al abogado | Ninguna lo dijo. **Sigue sin validar** |
| Los clientes pierden plazos o no entregan documentos | "En general, terminan enviándome todo lo solicitado" (A2). Solo hace seguimiento cuando hay urgencia |

## Lo que apareció y no esperábamos

1. **Los clientes usan IA y cuestionan al abogado.** "Los clientes le consultan todo y te dicen [...] el chat me dijo esto otro, y por qué vos no lo hacés" (A2).
2. **En ART, anticipar lo que va a pasar genera credibilidad.** "Yo siempre le digo lo que va a suceder [...] porque eso me hace quedar con el cliente que tengo conocimiento, porque después lo que yo le digo termina pasando" (A2). El proceso de ART "es muy estructurado, siempre pasa lo mismo". Los despidos varían más.
3. **El nivel de información depende del cliente.** Con clientes de confianza explica todo; con clientes conflictivos, lo mínimo. A los que tienen lesiones graves los sigue de forma proactiva (A2).
4. **Hay dos perfiles de abogado.** A2 se reconoce poco estructurada y cree que la herramienta le serviría más a una colega organizada: "hay muchos abogados que les sirve y otros no".
5. **Ya existen "portales" caseros.** A2 arma un grupo de WhatsApp por caso (apellido + tipo de caso) y recibe ahí los documentos.
6. **Clientes con más de un caso.** Por ejemplo, un accidente de tránsito y, por separado, un trámite de un familiar (A2).
7. **Los abogados no son de un solo fuero.** A2 lleva laborales, ART, tránsito y casos compartidos con colegas de otras materias.
8. **No hay un sistema común de documentos.** A1 usa Google Drive y un colega usa un sistema de gestión. A A2 Drive le resulta incómodo y guarda todo en carpetas en su computadora.
9. **Pedir documentos tiene su propio proceso.** A2 manda un instructivo para escanear (buena luz, fondo claro, PDF legible) y recuerda solo si hay plazo.
10. **Los clientes llegan por recomendación.** "Trabajo muchísimo por recomendación" (A2).
11. **Ya pagan por herramientas que les ahorran tiempo.** A2 pasó de ChatGPT gratis a pago porque le ahorraba "muchísimo tiempo".
12. **La relación con el cliente también es emocional.** En el chat de ejemplo, la clienta mezcla el caso con su situación personal (A1).
13. **El lenguaje del producto importa.** A2 no entendió "actualizar un caso". Los abogados no piensan en "actualizar", piensan en "avisarle al cliente".

---

## Estado de las hipótesis

| # | Hipótesis | Estado |
|---|---|---|
| 1 | Los clientes consultan varias veces por mes solo para saber el estado | Parcial: A1 sí (2 por día). A2 sin dato |
| 2 | A los abogados les quita tiempo responder consultas | **Sin confirmar** |
| 3 | Los clientes no entienden los términos | Indicio (A1) |
| 4 | Un abogado actualizaría el portal si le lleva muy poco tiempo | **Confirmada** por las dos, con la condición de que sea "un botón" |
| 5 | Los abogados pagarían | Parcial: A2 sí, si le ahorra tiempo. A1 sin dato |
| 6 | Los clientes pierden plazos o documentos por no enterarse | Débil |
| 7 | Los abogados quieren que el cliente vea el estado sin preguntar | **Refutada** en su forma original |

---

## Implicancias para el diseño

**Reglas de negocio**

- El abogado decide qué se publica y con qué nivel de detalle para cada cliente. Nada se muestra automáticamente.
- El portal no muestra montos de liquidación, salvo que el abogado lo decida.
- Un cliente puede tener más de un caso.
- El sistema admite distintos tipos de caso, aunque el MVP se diseña sobre ART.

**Funcionalidades**

- Avisar el estado con un toque, eligiendo una etapa predefinida.
- Plantilla del aviso: etapa actual, qué se hizo, próximo paso.
- Estado "Revisado, sin novedades", para responder la consulta más común sin escribir.
- La IA redacta el aviso en lenguaje simple y el abogado lo aprueba antes de enviarlo.
- Pedido de documentos con instructivo de escaneo incluido y recordatorio solo si hay plazo.
- Documentos sin depender de Google Drive.

**Lenguaje**

- Hablar de "avisarle al cliente", no de "actualizar el caso".

**Lo que el producto no reemplaza**

- El contacto humano. WhatsApp y las llamadas siguen siendo el canal para lo personal y lo urgente.

---

## ¿Es monetizable?

**Sí, con condiciones.** No como portal de transparencia para el cliente, pero sí como herramienta de credibilidad y ahorro de tiempo para el abogado.

**Quién paga:** el abogado, no el cliente.

**Modelo propuesto:** suscripción mensual por abogado, con un plan gratis limitado a pocos casos activos, porque compite con WhatsApp, que es gratis.

| A favor | En contra |
|---|---|
| Ya pagan por herramientas que les ahorran tiempo (IA) | La alternativa, WhatsApp, es gratis y ya la dominan |
| Consiguen clientes por recomendación: un cliente que confía recomienda más | No quieren informar más de lo necesario |
| Llevan 20 o más casos a la vez | Si agrega carga manual, lo abandonan |
| ART es un proceso repetitivo y estandarizable | El dolor de las consultas no está confirmado |

**Métricas para validarlo**

- % de abogados que siguen activos a los 30 días
- Casos activos por abogado
- Conversión de plan gratis a pago
- Clientes nuevos que llegan por recomendación

---

## A quién apuntamos

**Nueva propuesta de valor:** "Anticipale a tu cliente lo que va a pasar, y demostrá que tenías razón."

**Usuario que paga:** abogado laboralista independiente o estudio chico (2 a 5 personas), organizado, con 20 o más casos activos, muchos de ART. Ya usa IA y consigue clientes por recomendación.

- Necesita: ganar credibilidad, manejar expectativas, ahorrar tiempo al comunicar.

**Usuario final:** trabajador con un accidente o enfermedad profesional que reclama contra la ART. Está lesionado, muchas veces sin trabajar y ansioso por un proceso largo que no entiende.

- Necesita: saber qué va a pasar, sentir que su caso avanza, saber si tiene que hacer algo.

**A quién no apuntamos:** abogado que maneja todo por WhatsApp sin estructura y prefiere informar lo mínimo. Para él, cualquier herramienta es carga extra.

## MVP reenfocado

1. Hoja de ruta de ART que el abogado publica al iniciar el caso.
2. Marcar un paso como cumplido con un toque.
3. La IA redacta el aviso en lenguaje simple y el abogado lo aprueba.
4. Nivel de detalle definido por cliente.
5. Nunca muestra montos, salvo que el abogado lo decida.
6. Pedido de documentos con instructivo incluido.

---

## Limitaciones

- Son solo 2 entrevistas, y la primera es con una persona de confianza de la entrevistadora.
- Ninguna entrevistada tiene el perfil "organizado" al que ahora apuntamos.
- Todavía no se entrevistó a ningún cliente.
- La nueva dirección (hoja de ruta de ART) sale de lo que dijeron, pero nadie la vio todavía.

## Próximos pasos

1. Validar la hoja de ruta de ART con las dos abogadas: "Si al inicio de un caso de ART pudieras mostrarle al cliente la hoja de ruta que hoy le contás de palabra, y marcar cada paso cuando se cumple, ¿te serviría o preferirías no hacerlo? ¿Por qué?"
2. Entrevistar a un abogado más estructurado, como la colega que mencionó A2.
3. Entrevistar a 2 o 3 trabajadores que hayan tenido un reclamo contra una ART.
4. Con eso, pasar a los user flows del abogado y del cliente.
