# Qué se anima

El fallo más común: **o no hay animación, o es la genérica**, un fundido de
200 ms en todo. Pasa porque nadie decide el movimiento: se añade al final si
sobra tiempo.

## El orden

1. **La animación que ya trae tu librería de componentes.** Si el diálogo, la
   hoja o las pestañas ya animan, se usan así. No se reimplementan a mano.
2. **Una librería de animación** (Motion, GSAP, Reanimated…) solo para lo que la
   librería de componentes no cubre: transiciones de layout, coordinación entre
   varios elementos, gestos.
3. **CSS para hover y focus.** Nunca JavaScript para un cambio de color.

## Qué se anima, y qué no

| Momento | Movimiento | Duración |
|---|---|---|
| Entrada de una hoja o un diálogo | desde el borde | la que trae la librería; si la animas tú, con resorte (spring) |
| Cambio de pestaña | el indicador se desliza a la nueva | 0,2-0,3 s |
| Elementos que aparecen en una lista | escalonados, 30-50 ms entre uno y otro | 0,2 s cada uno |
| Espera de datos | skeleton con pulso | continuo |
| Confirmación de éxito | un solo gesto que remata | 0,4-0,6 s |
| Error | ningún movimiento decorativo | — |
| Hover y focus | CSS | 0,15 s |

**El pico y el final** (regla del pico y el final): lo que más se recuerda es el
remate de la tarea. Ahí se gasta el presupuesto de animación, no en la entrada
de la página.

## Los tres frenos

- **Respeta la preferencia de reducir movimiento** (`prefers-reduced-motion` en
  web, el ajuste del sistema en móvil). No es opcional.
- **Nada en bucle** fuera de un indicador de carga. Compite con la atención
  (atención selectiva).
- **Anima `transform` y `opacity`.** Animar `height`, `width` o `top` recalcula
  el layout en cada fotograma y se nota en móviles modestos.

## Lo que la animación tiene que ganarse

Una animación se queda si hace una de estas tres cosas: cubre una espera
(Doherty), señala un cambio de estado o remata una tarea (pico y final). Si no
hace ninguna, sobra.
