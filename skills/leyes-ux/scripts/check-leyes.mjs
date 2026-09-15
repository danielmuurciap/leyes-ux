#!/usr/bin/env node
/**
 * check-leyes — las leyes de UX que se pueden contar en código React (JSX/TSX)
 * con clases utilitarias al estilo Tailwind. Dos capas:
 *
 * DURAS (fallan, exit 1): no dependen del producto. Un objetivo táctil de 32 px
 * es pequeño en cualquier pantalla; un await tras un clic sin estado de espera
 * deja al usuario sin saber si pulsó.
 *
 * CONTEXTUALES (informan, exit 0): dependen de a qué viene el usuario. Un panel
 * comparativo tiene varios primarios a propósito. Se deciden con el contexto
 * del producto delante.
 *
 * Un gate que salta donde no toca se deja de leer. Por eso, ante la duda, las
 * duras callan: un falso negativo cuesta menos que un falso positivo.
 *
 * Uso:
 *   node check-leyes.mjs [--report] [--estricto] [--json] <dir|fichero>...
 *   node check-leyes.mjs --hook   (hook PostToolUse: lee el JSON por stdin)
 * Salida: 0 sin duras · 1 con duras (o contextuales con --estricto) ·
 *         2 mal uso (flag desconocido, ruta que no existe, nada que analizar)
 *
 * Excepción: `leyes:allow <id> <motivo>` en un comentario, todo en la misma
 * línea. Sin motivo no cuenta. Alcance:
 *  - objetivo-pequeno (regla de elemento): ese elemento, con el comentario en la
 *    línea donde empieza o en la siguiente a su cierre. No tapa a los vecinos.
 *  - las demás (reglas de fichero): el fichero entero.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const USO = "uso: check-leyes.mjs [--report] [--estricto] [--json] <dir|fichero>...  |  check-leyes.mjs --hook";
const AYUDA = `${USO}
  --report    lista todo sin fallar (exit 0)
  --estricto  las contextuales también fallan
  --json      salida en JSON: [{ fichero, linea, regla, capa, ley, detalle }]
  --hook      hook PostToolUse de Claude Code: lee el JSON por stdin, analiza el
              fichero editado y avisa al agente de las reglas duras (exit 2)
Excepción: // leyes:allow <id> <motivo>`;
const FLAGS = new Set(["--report", "--estricto", "--json", "--hook", "--help", "-h"]);

const EXT = /\.(tsx|jsx)$/;
const PRUEBA = /\.(test|spec|stories)\.(tsx|jsx)$/;  // los tests hacen await sin UI: no son pantalla
const SALTAR = new Set(["node_modules", "dist", "build", "coverage", ".next", "out", "storybook-static"]);

/** `leyes:allow <id> <motivo>` en una sola línea: el salto de línea no cuenta como separador. */
const permite = (id) => new RegExp(`leyes:allow[^\\S\\n]+${id}[^\\S\\n]+[\\p{L}\\d]`, "u");

function lineaDe(src, i) {
  let n = 1;
  for (let k = 0; k < i; k++) if (src.charCodeAt(k) === 10) n++;
  return n;
}
function statSafe(p) { try { return statSync(p); } catch { return null; } }

/**
 * Los tokens de altura con nombre (`h-control`, `min-h-row`) esconden su valor:
 * un `--spacing-control: 2.5rem` son 40 px y salta Fitts sin que se vea en el JSX.
 * Se resuelven contra el CSS del propio repo, subiendo desde el fichero analizado.
 * Sin CSS encontrado el mapa queda vacío y solo se juzgan los valores literales.
 */
const cacheTokens = new Map();
function tokensDeAltura(desde) {
  let dir = statSafe(desde)?.isDirectory() ? desde : join(desde, "..");
  for (let i = 0; i < 8 && dir !== "/"; i++) {
    if (cacheTokens.has(dir)) return cacheTokens.get(dir);
    const mapa = new Map();
    for (const css of buscarCss(dir)) {
      let src;
      try { src = readFileSync(css, "utf8"); } catch { continue; }
      for (const m of src.matchAll(/--spacing-([\w-]+)\s*:\s*([\d.]+)(rem|px)\s*;/g)) {
        const px = m[3] === "rem" ? parseFloat(m[2]) * 16 : parseFloat(m[2]);
        if (!mapa.has(m[1])) mapa.set(m[1], px);
      }
    }
    if (mapa.size) { cacheTokens.set(dir, mapa); return mapa; }
    dir = join(dir, "..");
  }
  return new Map();
}
/** Los CSS de tokens viven en `styles/` o en la raíz del paquete. No se escanea el repo entero. */
function buscarCss(dir) {
  const out = [];
  for (const rel of ["src/styles", "styles", "app", "src", "."]) {
    const d = join(dir, rel);
    if (!statSafe(d)?.isDirectory()) continue;
    let hijos; try { hijos = readdirSync(d); } catch { continue; }
    for (const f of hijos) if (f.endsWith(".css")) out.push(join(d, f));
  }
  return out;
}

/**
 * Índice del `>` que cierra la etiqueta que empieza en `i`. Salta comillas,
 * llaves y flechas: `onClick={() => x}` o `className="[&>svg]:size-4"` no la cierran.
 */
function finEtiqueta(src, i) {
  let prof = 0, comilla = null;
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (comilla) { if (c === comilla && src[j - 1] !== "\\") comilla = null; continue; }
    if (c === '"' || c === "'" || c === "`") comilla = c;
    else if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (c === ">" && prof <= 0 && src[j - 1] !== "=") return j;
  }
  return -1;
}

/** Elementos que son un objetivo que se pulsa: nativos y los componentes habituales de las librerías. */
const esNativo = (nombre) => nombre === "button" || nombre === "a";
const esComponente = (nombre) => /^(?:[A-Z]\w*\.)?(?:\w*Button|Link|NavLink)$/.test(nombre);

const BREAKPOINT = /^(?:sm|md|lg|xl|2xl)$/;
/** Clases de una etiqueta, separando la utilidad de sus variantes (`sm:`, `hover:`, `[&_svg]:`). */
function clases(texto) {
  return texto.split(/[\s"'`{}(),]+/).filter(Boolean).map((token) => {
    let prof = 0, corte = -1;
    for (let k = 0; k < token.length; k++) {
      if (token[k] === "[") prof++;
      else if (token[k] === "]") prof--;
      else if (token[k] === ":" && prof === 0) corte = k;
    }
    return { token, util: token.slice(corte + 1), variantes: corte === -1 ? [] : token.slice(0, corte).split(":") };
  });
}

/** Altura en px de `h-9`, `min-h-[40px]`, `size-control`…; undefined si no es una altura conocida. */
function alturaPx(util, tokens) {
  let m;
  if ((m = util.match(/^(?:min-h|h|size)-(\d+(?:\.\d+)?)$/))) return parseFloat(m[1]) * 4;
  if ((m = util.match(/^(?:min-h|h|size)-\[([\d.]+)(px|rem)\]$/))) return m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
  if ((m = util.match(/^(?:min-h|h|size)-([a-z][\w-]*)$/))) return tokens.get(m[1]);
  return undefined;
}

/** Cada check devuelve [{ i, detalle }], donde `i` es la posición en el fuente (para la línea). */
const REGLAS = [
  {
    id: "primario-multiple",
    capa: "contextual",
    ley: "Von Restorff · Atención selectiva",
    msg: "más de una acción primaria. Correcto en un panel comparativo o una página de precios; sospechoso en una pantalla de tarea. Decídelo con el contexto del producto",
    check(src) {
      const ms = [...src.matchAll(/variant=["'{]?\s*["']?(primary|default)["']?/g)];
      return ms.length > 1 ? [{ i: ms[1].index, detalle: `${ms.length} acciones primarias` }] : [];
    },
  },
  {
    id: "acento-sin-racionar",
    capa: "contextual",
    ley: "Von Restorff",
    msg: "muchos usos del acento. Si la pantalla compara o clasifica puede ser correcto; si es una tarea, el acento dejó de señalar",
    check(src) {
      // `text-primary-foreground` es el texto SOBRE el acento, no otro uso del acento.
      const ms = [...src.matchAll(/(?<![\w-])(bg|text|border|ring|from|to)-(primary|brand|accent)(?![\w-])/g)];
      return ms.length > 4 ? [{ i: ms[4].index, detalle: `${ms.length} usos del acento` }] : [];
    },
  },
  {
    id: "objetivo-pequeno",
    capa: "dura",
    alcance: "elemento",
    ley: "Fitts",
    msg: "objetivo táctil por debajo de 44 px. Comprueba el valor real del token antes de usarlo: un `h-control` de 2.5rem son 40 px",
    check(src, fichero) {
      const out = [];
      const tokens = tokensDeAltura(fichero || ".");
      const abre = /<([A-Za-z][\w.]*)(?=[\s>/])/g;
      let m;
      while ((m = abre.exec(src))) {
        const nombre = m[1];
        if (!esNativo(nombre) && !esComponente(nombre)) continue;
        const fin = finEtiqueta(src, m.index);
        if (fin === -1) continue;
        const etiqueta = src.slice(m.index, fin + 1);
        const cierraSola = src[fin - 1] === "/";
        // Un componente sin hijos (`<ExternalLink className="h-4" />`) suele ser un
        // icono con nombre de enlace, no un objetivo: callar es más barato.
        if (cierraSola && !esNativo(nombre)) continue;
        const cierre = cierraSola ? -1 : src.indexOf(`</${nombre}>`, fin);
        const finElemento = cierre === -1 ? fin + 1 : cierre;
        // La excepción es de ESTE elemento: en la línea donde empieza o en la
        // SIGUIENTE a su cierre. No en la anterior: taparía al vecino de arriba.
        const iniLinea = src.lastIndexOf("\n", m.index) + 1;
        const finLinea = src.indexOf("\n", finElemento);
        const finSig = finLinea === -1 ? -1 : src.indexOf("\n", finLinea + 1);
        if (permite("objetivo-pequeno").test(src.slice(iniLinea, finSig === -1 ? src.length : finSig))) continue;
        // Solo cuenta la etiqueta del objetivo, nunca sus hijos: el `h-4` de un
        // icono mide el glifo. Tampoco las variantes de escritorio (`sm:h-9`) ni
        // las que estilan a otro elemento (`[&_svg]:size-4`).
        const medidas = clases(etiqueta)
          .filter((c) => !c.variantes.some((v) => BREAKPOINT.test(v) || v.includes("[")))
          .map((c) => ({ c, px: alturaPx(c.util, tokens) }))
          .filter((x) => x.px !== undefined && x.px > 0);
        if (medidas.some((x) => x.c.util.startsWith("min-h-") && x.px >= 44)) continue;
        for (const { c, px } of medidas) {
          if (px >= 44) continue;
          const valor = c.util.split("-").pop();
          const origen = c.util.includes("[") ? ` = ${px} px` : /^[a-z]/.test(valor) ? ` = ${px} px (--spacing-${c.util.replace(/^(?:min-h|h|size)-/, "")})` : "";
          out.push({ i: m.index, detalle: `<${nombre}> con ${c.token}${origen}` });
        }
      }
      return out.filter((h, k) => out.findIndex((o) => o.i === h.i && o.detalle === h.detalle) === k);
    },
  },
  {
    id: "botones-en-vez-de-tabs",
    capa: "dura",
    ley: "Ley de Jakob · Modelo mental",
    msg: "3 o más botones ponen el mismo estado en valores distintos: eso es Tabs o ToggleGroup, no botones",
    check(src) {
      const setters = new Map();
      for (const m of src.matchAll(/onClick=\{\s*\(\s*\)\s*=>\s*\{?\s*(set[A-Z]\w*)\s*\(([^()]*)\)/g)) {
        const arg = m[2].trim();
        // Solo valores de una lista ("a", 2, Vista.Lista). true/false es abrir y cerrar, no cambiar de vista.
        if (!/^(?:"[^"]*"|'[^']*'|\d+|[A-Z]\w*\.\w+)$/.test(arg)) continue;
        const s = setters.get(m[1]) ?? { valores: new Set(), i: m.index };
        s.valores.add(arg);
        setters.set(m[1], s);
      }
      return [...setters]
        .filter(([, s]) => s.valores.size >= 3)
        .map(([nombre, s]) => ({ i: s.i, detalle: `${s.valores.size} botones llaman a ${nombre}() con valores distintos` }));
    },
  },
  {
    id: "async-sin-estado",
    capa: "dura",
    ley: "Umbral de Doherty",
    msg: "hay un await detrás de una acción del usuario y ningún estado de espera; el usuario no sabe si pulsó",
    check(src) {
      const m = /\bawait\s/.exec(src);
      if (!m) return [];
      // Sin nada que el usuario dispare (un server component, un loader) no hay a quién dar feedback aquí.
      if (!/\bon(?:Click|Submit|Press|Change)\s*=|\b(?:formAction|action)=\{/.test(src)) return [];
      const limpio = src.replace(/\bloading=["'](?:lazy|eager)["']/g, "");
      if (/\b(isLoading|isPending|loading|pending|isSubmitting|submitting|isFetching|isMutating|Skeleton|Spinner|Loader\w*|useTransition|useOptimistic|useFormStatus|useActionState|Suspense)\b/.test(limpio)) return [];
      return [{ i: m.index, detalle: "await sin isLoading, isPending, useFormStatus ni Skeleton" }];
    },
  },
  {
    id: "lista-sin-vacio",
    capa: "contextual",
    ley: "Ley de Tesler · Fluir",
    msg: "lista sin rama de vacío. No aplica si los elementos son fijos y conocidos (por ejemplo, 3 pestañas)",
    check(src) {
      const m = /\.map\(/.exec(src);
      if (!m) return [];
      if (/\.length\s*===?\s*0|\.length\s*\?|!\w+\.length|EmptyState|Empty\b|vacio|vacío/i.test(src)) return [];
      return [{ i: m.index, detalle: ".map( sin rama para lista vacía" }];
    },
  },
];

function analizar(fichero) {
  const src = readFileSync(fichero, "utf8");
  const hallazgos = [];
  for (const r of REGLAS) {
    // Excepción de FICHERO: solo para reglas de fichero. Las de elemento filtran ellas mismas.
    if (r.alcance !== "elemento" && permite(r.id).test(src)) continue;
    for (const h of r.check(src, fichero)) {
      hallazgos.push({ fichero, linea: lineaDe(src, h.i), regla: r.id, capa: r.capa, ley: r.ley, msg: r.msg, detalle: h.detalle });
    }
  }
  return hallazgos;
}

function* walk(p) {
  // Un symlink roto o un directorio sin permiso NO puede tumbar el gate:
  // un gate que rompe el build por el motivo equivocado acaba desactivado.
  const st = statSafe(p);
  if (!st) return;
  if (st.isFile()) { if (EXT.test(p) && !PRUEBA.test(p)) yield p; return; }
  let entradas;
  try { entradas = readdirSync(p); } catch { return; }
  for (const e of entradas) {
    if (SALTAR.has(e) || e.startsWith(".")) continue;
    yield* walk(join(p, e));
  }
}

/**
 * Hook PostToolUse: recibe por stdin el JSON de la herramienta que acaba de
 * editar un fichero. Si el fichero tiene reglas duras, las escribe en stderr y
 * sale con 2 para que el agente las vea. Ante cualquier error, silencio y 0:
 * un hook roto no puede bloquear al agente.
 */
function modoHook() {
  let fichero;
  try { fichero = JSON.parse(readFileSync(0, "utf8") || "{}").tool_input?.file_path; } catch { process.exit(0); }
  if (typeof fichero !== "string" || !EXT.test(fichero) || PRUEBA.test(fichero) || !statSafe(fichero)?.isFile()) process.exit(0);
  let duras;
  try { duras = analizar(fichero).filter((h) => h.capa === "dura"); } catch { process.exit(0); }
  if (!duras.length) process.exit(0);
  const lineas = duras.map((h) => `- línea ${h.linea} · ${h.regla} (${h.ley}): ${h.detalle}. ${h.msg}.`);
  process.stderr.write(
    `leyes-ux: ${duras.length} regla(s) dura(s) en ${fichero}\n${lineas.join("\n")}\n` +
    "Corrígelas antes de seguir. Si es una excepción justificada, anótala en el código con leyes:allow <regla> <motivo>.\n",
  );
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) { console.log(AYUDA); process.exit(0); }
const raros = args.filter((a) => a.startsWith("-") && !FLAGS.has(a));
if (raros.length) { console.error(`flag desconocido: ${raros.join(", ")}\n${USO}`); process.exit(2); }
if (args.includes("--hook")) modoHook();

const REPORT = args.includes("--report");
const ESTRICTO = args.includes("--estricto");
const JSON_OUT = args.includes("--json");
const targets = args.filter((a) => !a.startsWith("-"));
if (!targets.length) { console.error(USO); process.exit(2); }
const noExisten = targets.filter((t) => !statSafe(t));
if (noExisten.length) { console.error(`no existe: ${noExisten.join(", ")}`); process.exit(2); }
const ficheros = targets.flatMap((t) => [...walk(t)]);
if (!ficheros.length) { console.error(`no hay ficheros .jsx ni .tsx que analizar en: ${targets.join(", ")}`); process.exit(2); }

const hallazgos = ficheros.flatMap(analizar);
const duras = hallazgos.filter((h) => h.capa === "dura").length;
const contextuales = hallazgos.length - duras;

if (JSON_OUT) {
  console.log(JSON.stringify(hallazgos.map(({ msg, ...h }) => ({ ...h, fichero: relative(process.cwd(), h.fichero) })), null, 2));
} else if (!hallazgos.length) {
  console.log(`✓ leyes: sin infracciones en ${ficheros.length} fichero(s)`);
} else {
  let clave = "";
  for (const h of hallazgos) {
    if (h.fichero + h.regla !== clave) {
      clave = h.fichero + h.regla;
      console.log(`\n[${h.capa === "dura" ? "DURA" : "contexto"}] ${h.regla} — ${h.msg}\n  ley: ${h.ley}`);
    }
    console.log(`  ${relative(process.cwd(), h.fichero)}:${h.linea}  ${h.detalle}`);
  }
  console.log(`\n${duras} dura(s) y ${contextuales} contextual(es) en ${new Set(hallazgos.map((h) => h.fichero)).size} fichero(s).`);
  if (contextuales && !ESTRICTO) {
    console.log("Las contextuales NO fallan: se deciden con el contexto del producto.");
    console.log("Si ya se decidió que aquí no aplican, anótalo con `// leyes:allow <id> <motivo>`.");
  }
}
process.exit(REPORT ? 0 : duras || (ESTRICTO && contextuales) ? 1 : 0);
