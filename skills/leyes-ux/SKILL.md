---
name: leyes-ux
description: "Las 30 leyes de UX (Fitts, Hick, Miller, Jakob, Doherty, Von Restorff…) convertidas en decisiones de interfaz: qué componente va, qué número hay que cumplir y qué se comprueba solo. Enruta por superficie — formulario, lista, navegación, filtros, estado vacío, carga, móvil, error — y separa lo universal de lo que depende del producto. Incluye un gate para React (JSX/TSX). Úsala antes de construir una pantalla o un componente y antes de darla por terminada. No sirve para backend."
license: MIT
---

# Leyes de UX, en forma de decisión

Una lista de 30 leyes no cambia ninguna decisión. Esta skill las convierte en
tres cosas que sí: **qué componente va**, **qué número hay que cumplir** y
**qué se puede comprobar de forma automática**.

## El orden

1. **Decidir.** Busca la superficie en la tabla de abajo y lee solo esa fila.
   Elige los componentes con `references/componentes.md` y el movimiento con
   `references/movimiento.md`.
2. **Construir.** Cumple los presupuestos duros. Si un contextual no aplica,
   escribe por qué.
3. **Comprobar.** Corre el gate si el proyecto usa JSX/TSX y vuelve a pasar la
   fila de la superficie contra lo construido.

El paso 1 es el que se salta siempre, y es la razón de que se itere tanto sobre
el aspecto: se empezó a escribir código sin haber decidido.

Para auditar algo que ya está construido, usa la skill `critica-ux`.

## Enrutado por superficie

Busca la que estás construyendo. Lee **solo** esa fila.

| Superficie | Leyes que mandan | Qué significa aquí |
|---|---|---|
| **Formulario** | Hick · Tesler · Postel · Prägnanz | Una columna y un ancho de campo. De 2 a 7 opciones excluyentes → `RadioGroup`, no `Select`. Acepta la entrada con espacios, guiones o mayúsculas y normalízala tú. Si interrumpe otra tarea, se abre cuando se pide, no aparece abierto. |
| **Lista / tabla** | Miller · Fragmentación · Posición en serie | Más de 7 elementos sin agrupar ni búsqueda es un fallo. Lo importante al principio y al final; lo secundario en medio. Siempre hay rama de lista vacía. |
| **Navegación entre vistas** | Jakob · Modelo mental · Región común | Si cambia lo que se VE, es `Tabs` o `SegmentedControl`. **Nunca botones sueltos.** Ver `references/componentes.md`. |
| **Filtros** | Hick · Sobrecarga de opciones | `ToggleGroup` o `Checkbox`. Resalta el recomendado. Comparación lado a lado si hay que comparar. |
| **Estado vacío** | Zeigarnik · Tendencia a la meta · Fluir | Explica qué aparecerá aquí y cómo se consigue lo primero, con **una** acción. Nunca un bloque de ceros. |
| **Espera / carga** | Doherty · Parkinson | Feedback en menos de 400 ms. `Skeleton` con la forma del contenido, no un spinner centrado. Progreso visible si hay pasos. |
| **Pantalla completa** | Carga cognitiva · Occam · Von Restorff | **Una** acción primaria, ≤ 5 bloques y ≤ 3 niveles de anidación. Si no cabe, se parte con navegación interna. |
| **Móvil** | Fitts · Jakob | Objetivos ≥ 44 px. Acción principal al alcance del pulgar, en una barra inferior. `Sheet` en vez de `Popover`. En web, `dvh` en vez de `vh`. |
| **Confirmación / éxito** | Fin de pico · Zeigarnik | Es lo que se recuerda. Di qué pasó y qué sigue. Aquí se gasta el presupuesto de animación. |
| **Error** | Postel · Fin de pico | Lo negativo se recuerda con más fuerza. Di qué pasó, qué se ha conservado y cómo salir. Sin movimiento decorativo. |

## Antes de los números: ¿esta ley aplica aquí?

**Una ley no se aplica porque exista.** Se aplica cuando el fallo que previene
puede ocurrirle a **este** usuario en **esta** pantalla. Aplicarlas todas por
umbral produce interfaces genéricas y un gate que nadie lee.

La pregunta, antes de cualquier número:

> **¿A qué viene el usuario aquí, y qué pasa si se equivoca?**

Búscalo en el propio proyecto: el README, los documentos de producto o de
diseño, el texto de la pantalla. Si no está, pregúntaselo a la persona antes de
aplicar umbrales. **El contexto del producto manda sobre las leyes.** Sin él,
los números de abajo son el valor por defecto de una *pantalla de tarea*, y
nada más.

### Dónde cambian los presupuestos

| Si la pantalla… | Cambia | Por qué |
|---|---|---|
| **compara** (precios, planes, dos periodos) | varios primarios y varios acentos son correctos | el acento es el eje de comparación, no el señalizador |
| **es un panel de control** | varios primarios | hay varias tareas legítimas del mismo rango |
| **es de configuración** | muchas opciones visibles | el usuario viene a buscar una concreta; esconderlas en pasos lo empeora |
| **es de exploración** (catálogo, búsqueda) | más de 7 elementos es lo esperado | Miller habla de memoria de trabajo, no de cuánto se ve al hacer scroll |
| **es de tarea** (formulario, alta, pago) | los umbrales de abajo aplican tal cual | aquí sí hay una sola respuesta a «a qué viene» |
| **es un lienzo** (editor, mapa) | casi nada de esto aplica | el usuario viene a manipular, no a decidir |

Si tu pantalla está en las cinco primeras filas, **no fuerces el umbral**:
anota por qué no aplica. Esa nota es la decisión, y vale más que el número.

## Los presupuestos por defecto — pantalla de tarea

Dos capas, y la diferencia importa.

**Duras.** No dependen del producto. El gate **falla**.

| Presupuesto | Límite | Ley | Por qué es universal |
|---|---|---|---|
| Objetivo táctil | ≥ 44 px | Fitts | la mano no cambia con el producto. 44 es el objetivo de WCAG 2.5.5 y de Apple; el mínimo AA de WCAG 2.5.8 es 24 px |
| Feedback tras una acción | < 400 ms | Doherty | sin feedback, el usuario no sabe si pulsó |
| Botones que cambian el mismo estado | < 3 | Jakob | un botón que navega miente sobre lo que hace |

**Contextuales.** El gate **informa y no bloquea**. Se deciden mirando el
producto.

| Presupuesto | Por defecto | Ley | Cuándo NO aplica |
|---|---|---|---|
| Acciones primarias | 1 | Von Restorff | comparativas, paneles de control |
| Usos del acento por fichero | ≤ 4 | Von Restorff | cuando el acento es el eje de comparación |
| Lista sin rama de vacío | 0 | Tesler | elementos fijos y conocidos |
| Opciones visibles sin agrupar | ≤ 7 | Hick · Miller | configuración, catálogos, exploración |
| Bloques por pantalla | ≤ 5 | Carga cognitiva | paneles de control |
| Niveles de anidación visual | ≤ 3 | Prägnanz | lienzos y editores |
| Anchos de campo en un formulario | 1 | Semejanza | dos campos que son partes del mismo dato |

## El gate

```bash
node <carpeta de esta skill>/scripts/check-leyes.mjs [--report] [--estricto] <ruta>
```

Analiza ficheros `.jsx` y `.tsx` (salvo tests y stories) y entiende clases
utilitarias al estilo Tailwind. Necesita Node 18 o superior. En otro stack no
aplica: usa las tablas a mano.

| Regla | Capa | Qué detecta |
|---|---|---|
| `objetivo-pequeno` | dura | `<button>` o `<a>` con altura por debajo de 44 px: `h-1`…`h-10`, `size-*` en la etiqueta, `h-[40px]`, o un token `--spacing-*` del CSS del proyecto que resuelve a menos de 44 px |
| `botones-en-vez-de-tabs` | dura | 3 o más `onClick={() => setX(...)}` sobre el mismo estado |
| `async-sin-estado` | dura | un `await` en un fichero sin `isLoading`, `isPending`, `Skeleton`, `useTransition`… |
| `primario-multiple` | contextual | más de un `variant="primary"` o `variant="default"` |
| `acento-sin-racionar` | contextual | más de 4 clases `bg-`, `text-`, `border-`, `ring-`, `from-` o `to-` con `primary`, `brand` o `accent` |
| `lista-sin-vacio` | contextual | un `.map(` sin rama para la lista vacía |

Sale con `0` si no hay duras, `1` si las hay y `2` si el uso es incorrecto.
`--estricto` hace que las contextuales también fallen, para cuando el equipo ya
decidió el contexto. `--report` no falla nunca.

**Excepción:** `// leyes:allow <id> <motivo>` (en JSX,
`{/* leyes:allow <id> <motivo> */}`). **Sin motivo no cuenta.** En
`objetivo-pequeno` vale para el elemento: en su misma línea o en la siguiente a
su cierre. En las demás reglas vale para el fichero entero. En las contextuales
el motivo es lo único que importa: «este panel compara dos periodos, los dos
primarios son el diseño».

Es heurístico: lee texto, no renderiza. Antes de fiarte de él en un proyecto,
provoca un fallo a propósito y comprueba que sale en rojo. Un gate que nunca has
visto fallar no sabes si funciona.

## Lo que esta skill no arregla

- **Si una ley aplica aquí.** Lo decide el contexto. Un aviso contextual en una
  pantalla comparativa es un falso positivo, y un gate con falsos positivos se
  deja de leer.
- **El aspecto visual.** Que algo guste no lo decide una ley.
- **Tokens, contraste y accesibilidad completa.** Necesitan sus propias
  comprobaciones.
- **Estilos fuera de las clases.** CSS-in-JS, estilos en línea o CSS externo no
  los ve el gate, salvo los tokens `--spacing-*`.

## Ficheros

- `references/leyes.md` — las 30 leyes: qué dicen, qué deciden en una interfaz y
  cuándo se malinterpretan. **Consulta, no lectura previa.**
- `references/componentes.md` — qué componente va en cada situación.
- `references/movimiento.md` — qué se anima, cuánto y en qué orden.
- `scripts/check-leyes.mjs` — el gate.
