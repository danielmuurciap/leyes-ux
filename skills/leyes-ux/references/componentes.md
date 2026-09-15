# Qué componente va aquí

El fallo más común: **botones sueltos donde el patrón pide un componente**. Un
botón que cambia de vista miente: parece que ejecuta algo y lo que hace es
navegar.

Esto es una **tabla de consulta**. Se mira antes de escribir el componente. Si
el caso no está, elige el más parecido y di por qué. Los nombres son los
habituales en Radix, shadcn/ui, MUI o Chakra; traduce al equivalente de tu
librería o plataforma.

## La pregunta que decide

> **¿La acción cambia lo que se VE, o cambia lo que HAY?**
> Cambia lo que se ve → navegación (pestañas, control segmentado, filtros).
> Cambia lo que hay → acción (botón).

Un botón que no escribe nada, no envía nada y no abre nada **no es un botón**.

## Tabla

| Situación | Componente | Nunca |
|---|---|---|
| 2-5 vistas excluyentes de un mismo objeto | `Tabs` | botones que cambian un estado |
| 2-3 opciones excluyentes, cortas, siempre visibles | `SegmentedControl` / `ToggleGroup` de selección única | dos botones que cambian de variante según cuál está activo |
| Más de 5 vistas excluyentes | `Select` o navegación lateral | una fila de pestañas con scroll |
| Filtros que se combinan | `ToggleGroup` de selección múltiple o `Checkbox` | botones que se «activan» |
| Una opción de una lista larga | `Combobox` con búsqueda | un `Select` con 40 opciones |
| 2-7 opciones excluyentes en un formulario | `RadioGroup` | `Select`, que esconde las opciones (Hick) |
| Encendido/apagado con efecto inmediato | `Switch` | `Checkbox` más un botón Guardar |
| Encendido/apagado que se aplica al enviar | `Checkbox` | `Switch`, que promete un efecto inmediato que no hay |
| Información secundaria bajo demanda, escritorio | `Popover` | una sección desplegable dentro de la tarjeta |
| Información secundaria bajo demanda, móvil | `Sheet` (hoja inferior) | `Popover` |
| Formulario que interrumpe la tarea | `Dialog` en escritorio / `Sheet` en móvil | un formulario abierto de entrada en la página |
| Confirmar algo destructivo | `AlertDialog` | un `Dialog` normal, o el `confirm()` del navegador |
| Aviso del resultado de una acción | `Toast` | un banner fijo en la página |
| Aviso persistente del estado del sistema | `Alert` en la página | `Toast`, que se va y no vuelve |
| Lista larga de elementos homogéneos | lista con agrupación, orden y búsqueda | scroll infinito sin ancla |
| Dato que tarda en llegar | `Skeleton` con la forma del contenido | spinner centrado |
| Paso a paso con final | `Stepper` con progreso visible | pantallas sueltas sin decir cuántas faltan |
| Acción principal de la pantalla en móvil | barra fija inferior | botón al final de un scroll largo |

Los números (tamaños, tiempos, cuántas opciones) están en los presupuestos del
`SKILL.md`.
