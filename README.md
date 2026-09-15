# leyes-ux

Las 30 leyes de UX convertidas en skills para agentes de código. En vez de
recitar a Fitts o a Hick, deciden **qué componente va**, **qué número hay que
cumplir** y **qué se puede comprobar solo**.

Funciona con Claude Code, Codex, Cursor, OpenCode y cualquier agente que lea
skills en formato `SKILL.md`.

## Qué trae

| Skill | Para qué | En Claude Code |
|---|---|---|
| `leyes-ux` | Decidir antes de construir una pantalla, y comprobarla antes de darla por terminada | `/leyes-ux` |
| `critica-ux` | Auditar una pantalla que ya existe (código, URL o captura) y devolver hallazgos con su arreglo | `/critica-ux` |

Dentro de `leyes-ux` va `check-leyes.mjs`, un gate para proyectos React
(JSX/TSX) que falla cuando hay objetivos táctiles de menos de 44 px, `await` sin
estado de espera o botones haciendo de pestañas.

Al terminar una pantalla, `leyes-ux` obliga al agente a entregar un bloque con
el tipo de pantalla, cada presupuesto («cumple» o «no aplica: motivo») y la
salida del gate. Así se ve qué decidió y qué no comprobó.

## Instalar

### En cualquier agente

```bash
npx skills add danielmuurciap/leyes-ux
```

Usa [skills](https://github.com/vercel-labs/skills), que pregunta en qué agentes
instalarlas. Con `-g` quedan para tu usuario y no solo para el proyecto.

### En Claude Code, como plugin

```text
/plugin marketplace add danielmuurciap/leyes-ux
/plugin install leyes-ux@leyes-ux
```

Instaladas como plugin, llevan su prefijo: `/leyes-ux:leyes-ux` y
`/leyes-ux:critica-ux`. El plugin trae además un **hook**: cada vez que el
agente edita un `.jsx` o `.tsx`, corre el gate sobre ese fichero y le devuelve
las reglas duras que incumple, sin esperar a que se acuerde de comprobarlo.

### A mano

Copia las dos carpetas de `skills/` a la carpeta de skills de tu agente (en
Claude Code, `~/.claude/skills/`). Tienen que quedar una junto a la otra:
`critica-ux` usa los ficheros de `leyes-ux`. Así no hay hook.

## Uso

Antes de construir:

```text
/leyes-ux voy a hacer el formulario de alta de clientes
```

Para auditar algo que ya está hecho:

```text
/critica-ux src/app/checkout/page.tsx
/critica-ux https://tu-app.com/precios
```

En agentes sin comandos, pídelo con palabras («revisa la UX de esta pantalla»):
la skill se carga por su descripción.

El gate, a mano o en CI (la ruta depende de dónde se instaló):

```bash
node ~/.claude/skills/leyes-ux/scripts/check-leyes.mjs src
```

| Código de salida | Significa |
|---|---|
| `0` | sin infracciones duras |
| `1` | hay duras, o contextuales con `--estricto` |
| `2` | uso incorrecto: flag desconocido, ruta que no existe o ninguna `.jsx`/`.tsx` |

Cada aviso sale como `archivo:línea`, y `--json` devuelve la misma lista para
otras herramientas. Qué detecta cada regla y cómo se anota una excepción está en
[`skills/leyes-ux/SKILL.md`](skills/leyes-ux/SKILL.md#el-gate).

## Cómo piensa

- **Una ley solo aplica si el fallo que previene puede pasarle a este usuario
  en esta pantalla.** Una página de precios tiene varios botones primarios a
  propósito. Por eso hay dos capas: las **duras** (Fitts, Doherty) fallan en
  cualquier producto; las **contextuales** (Von Restorff, Hick) avisan y se
  deciden con el contexto.
- **Se decide antes de construir.** Una tabla por superficie dice qué leyes
  mandan en un formulario, una lista, un estado vacío, una espera o un error, y
  qué componente toca en cada caso.
- **Ante la duda, el gate calla.** Un falso positivo en una regla dura hace que
  se deje de usar; un falso negativo solo deja pasar un caso.

## Desarrollo

```bash
npm test        # el gate, sin coste
npm run evals   # el agente con y sin el plugin; necesita Claude Code y gasta tokens
```

Las evals están en `evals/`. Cada caso pide a Claude construir o auditar algo y
comprueba el resultado: que un selector de día, semana y mes salga con pestañas
y no con botones, que tres opciones de envío sean radios y no un `select`, que
guardar enseñe un estado de espera, que los botones de icono midan 44 px, que
una lista tenga rama de vacío y que la crítica encuentre los fallos plantados.
`claude plugin eval` repite cada caso sin el plugin y enseña la diferencia.

Node 18 o superior, sin dependencias.

## Créditos y licencia

[MIT](LICENSE).

La selección de 30 leyes sigue [Laws of UX](https://lawsofux.com/es/), de Jon
Yablonski. Ese contenido está publicado bajo
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/), así que
este repositorio no lo copia: los textos son propios, cada ley cita su
investigación original y enlaza a su página en lawsofux.com. Es un proyecto
independiente, sin relación con Laws of UX.
