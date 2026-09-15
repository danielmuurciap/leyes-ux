---
name: critica-ux
description: "Audita una pantalla o un flujo ya construido contra las leyes de UX y devuelve hallazgos priorizados, cada uno con la ley, la evidencia y el arreglo concreto. Acepta código (un componente o una carpeta), una URL o una captura. Úsala cuando pidan revisar, criticar o auditar la UX de algo que ya existe. Para decidir antes de construir, usa leyes-ux."
license: MIT
argument-hint: "<ruta | URL | captura> [contexto del producto]"
---

# Crítica de UX

Devuelve **pocos hallazgos que cambian lo que se hace**, no un repaso de las 30
leyes. Un hallazgo sin evidencia o sin arreglo concreto no se entrega.

## Qué necesitas

- **Lo que se audita**: la ruta, la URL o la captura que indique la persona.
- **La skill `leyes-ux`**, instalada junto a esta: `../leyes-ux/SKILL.md` y sus
  `references/`. Si no está, dilo al principio y sigue con lo que sabes de las
  leyes.

## Pasos

1. **Contexto primero.** Responde en una línea: *¿a qué viene el usuario aquí, y
   qué pasa si se equivoca?* Clasifica la pantalla (tarea, comparación, panel de
   control, configuración, exploración o lienzo) con la tabla «Dónde cambian los
   presupuestos» de `leyes-ux`. Sácalo del código, del README o de la propia
   pantalla. Si no se puede deducir, haz **una** pregunta y espera.
2. **Mira la pantalla de verdad.**
   - Código: lee los componentes y busca sus estados de carga, vacío y error.
   - URL: si tienes navegador, ábrela en móvil (unos 390 px) y en escritorio.
   - Captura: úsala tal cual, y apunta que los estados que no salen en ella no
     se han podido comprobar.
3. **Parte la pantalla en superficies** (formulario, lista, navegación,
   filtros…) y aplica a cada una **solo su fila** de la tabla de enrutado de
   `leyes-ux`. Para el componente correcto, `references/componentes.md`.
4. **Corre el gate** si hay JSX o TSX:
   `node ../leyes-ux/scripts/check-leyes.mjs --report <ruta>`.
   Cada aviso es una pista, no un hallazgo: confírmalo en el código antes de
   reportarlo, y descarta los contextuales que la clasificación del paso 1
   justifica.
5. **Ataca cada hallazgo antes de entregarlo.** ¿El fallo puede ocurrirle a
   *este* usuario *aquí*? Si no, fuera, o a «No aplica aquí».

## Formato de salida

```
Pantalla: <qué es> · Tipo: <tarea | comparación | …>
El usuario viene a: <una línea>

1. [Alta] <el problema, en una frase>
   Ley: <nombre> · Evidencia: <archivo:línea | zona de la captura>
   Arreglo: <el cambio concreto: componente, valor o texto>

2. [Media] …

No aplica aquí: <ley o regla> — <por qué, en una línea>
No comprobado: <lo que no se pudo ver: estados, móvil, tiempos reales>
```

- **Alta**: impide o hace fallar la tarea, o incumple un presupuesto duro.
- **Media**: la ralentiza o genera dudas.
- **Baja**: pulido.

Como mucho 10 hallazgos, de mayor a menor prioridad. Si hay más, di cuántos se
quedan fuera.

## Reglas

- **Evidencia concreta en cada hallazgo.** «Mejorar la jerarquía» no es un
  hallazgo; «tres botones con `variant="primary"` en `Checkout.tsx:42-58`» sí.
- **El arreglo dice qué cambiar**, no qué principio seguir.
- **Separa lo medido de lo supuesto.** Si no has medido un tiempo de respuesta o
  un tamaño real, dilo en el hallazgo.
- **No reescribas la pantalla** salvo que te lo pidan.
