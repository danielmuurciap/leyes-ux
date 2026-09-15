#!/usr/bin/env node
/**
 * check-leyes — las leyes de UX que se pueden contar en código React (JSX/TSX)
 * con clases utilitarias al estilo Tailwind. Dos capas:
 *
 * DURAS (fallan, exit 1): no dependen del producto. Un objetivo táctil de 32 px
 * es pequeño en cualquier pantalla; un await sin estado de espera deja al
 * usuario sin saber si pulsó.
 *
 * CONTEXTUALES (informan, exit 0): dependen de a qué viene el usuario. Un panel
 * comparativo tiene varios primarios a propósito; una página de precios usa el
 * acento para comparar. Von Restorff dice «haz que lo importante destaque», no
 * «máximo uno». Se deciden con el contexto del producto delante.
 *
 * Un gate que salta donde no toca se deja de leer. Por eso la capa contextual
 * no bloquea salvo con --estricto.
 *
 * Uso: node check-leyes.mjs [--report] [--estricto] <dir|fichero>...
 *   --report    lista todo sin fallar (exit 0)
 *   --estricto  las contextuales también fallan
 * Salida: 0 sin duras · 1 con duras (o contextuales con --estricto) · 2 mal uso
 *
 * Excepción: comentario `leyes:allow <id> <motivo>`, un id por comentario. Sin
 * motivo no cuenta: una excepción sin motivo es deuda invisible. Su alcance
 * depende de la regla:
 *  - reglas de ELEMENTO (objetivo-pequeno): vale para ese elemento, puesta en
 *    su misma línea o en la siguiente a su cierre. No tapa a los vecinos.
 *  - reglas de FICHERO (las demás): vale para el fichero entero, porque la regla
 *    misma es del fichero (hay await sin estado, hay N primarios).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const USO = "uso: check-leyes.mjs [--report] [--estricto] <dir|fichero>...";
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`${USO}
  --report    lista todo sin fallar (exit 0)
  --estricto  las contextuales también fallan
Excepción: // leyes:allow <id> <motivo>`);
  process.exit(0);
}
const REPORT = args.includes("--report");
const ESTRICTO = args.includes("--estricto");
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) {
  console.error(USO);
  process.exit(2);
}

const EXT = /\.(tsx|jsx)$/;
const PRUEBA = /\.(test|spec|stories)\.(tsx|jsx)$/;  // los tests hacen await sin UI: no son pantalla
const SALTAR = new Set(["node_modules", "dist", "build", "coverage", ".next", "out", "storybook-static"]);

/** `leyes:allow <id> <motivo>`: el motivo tiene que empezar por letra o dígito, así `*\/}` no cuenta como motivo. */
const permite = (id) => new RegExp(`leyes:allow\\s+${id}\\s+[\\p{L}\\d]`, "u");

/**
 * Los tokens de altura con nombre (`h-control`, `min-h-row`) esconden su valor:
 * un `--spacing-control: 2.5rem` son 40 px y salta Fitts sin que se vea en el JSX.
 * Se resuelven contra el CSS del propio repo, subiendo desde el fichero analizado.
 * Sin CSS encontrado el mapa queda vacío y solo se juzgan los números literales.
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
function statSafe(p) { try { return statSync(p); } catch { return null; } }
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

/** Reglas de FICHERO: miran el fichero entero, no una línea. */
const REGLAS = [
  {
    id: "primario-multiple",
    capa: "contextual",
    ley: "Von Restorff · Atención selectiva",
    msg: "más de una acción primaria. Correcto en un panel comparativo o una página de precios; sospechoso en una pantalla de tarea. Decídelo con el contexto del producto",
    check(src) {
      const n = (src.match(/variant=["'{]?\s*["']?(primary|default)["']?/g) || []).length;
      return n > 1 ? [`${n} acciones primarias`] : [];
    },
  },
  {
    id: "acento-sin-racionar",
    capa: "contextual",
    ley: "Von Restorff",
    msg: "muchos usos del acento. Si la pantalla compara o clasifica puede ser correcto; si es una tarea, el acento dejó de señalar",
    check(src) {
      // `text-primary-foreground` es el texto SOBRE el acento, no otro uso del acento.
      const n = (src.match(/(?<![\w-])(bg|text|border|ring|from|to)-(primary|brand|accent)(?![\w-])/g) || []).length;
      return n > 4 ? [`${n} usos del acento`] : [];
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
      // La altura del objetivo no siempre está en la etiqueta: en una fila de lista
      // la marca un hijo. Se escanea el bloque entero del botón o enlace.
      // `=>` dentro de la etiqueta (onClick={() => …}) no la cierra.
      const abre = /<(button|a)\b(?:=>|[^>])*>/g;
      let m;
      while ((m = abre.exec(src))) {
        const cierre = src.indexOf(`</${m[1]}>`, m.index);
        const finBloque = cierre === -1 ? src.length : cierre;
        const bloque = src.slice(m.index, finBloque);
        const resto = bloque.slice(m[0].length);
        // La excepción es de ESTE elemento: en su línea o en la SIGUIENTE a su
        // cierre (un comentario JSX va debajo). No en la anterior: entre dos
        // botones adyacentes taparía a los dos.
        const iniLinea = src.lastIndexOf("\n", m.index) + 1;
        const finLinea = src.indexOf("\n", finBloque);
        const finSig = finLinea === -1 ? -1 : src.indexOf("\n", finLinea + 1);
        const entorno = src.slice(iniLinea, finSig === -1 ? src.length : finSig);
        if (permite("objetivo-pequeno").test(entorno)) continue;
        // `size-*` solo cuenta en la etiqueta raíz: un `size-icon` dentro mide el
        // GLIFO, no el objetivo, y reportarlo es el falso positivo que mata al gate.
        const clases = [...m[0].matchAll(/\b(?:min-h|h|size)-([\w-]+)\b/g),
                        ...resto.matchAll(/\b(?:min-h|h)-([\w-]+)\b/g)];
        for (const c of clases) {
          const v = c[1];
          if (/^(?:[1-9]|10)$/.test(v)) { out.push(`<${m[1]}> con ${c[0]}`); continue; }
          const px = tokens.get(v);
          if (px !== undefined && px < 44) out.push(`<${m[1]}> con ${c[0]} = ${px} px (--spacing-${v})`);
        }
        // Valores arbitrarios: `h-[40px]`, `min-h-[2.5rem]`.
        const arbitrarias = [...m[0].matchAll(/(?<![\w-])(?:min-h|h|size)-\[([\d.]+)(px|rem)\]/g),
                             ...resto.matchAll(/(?<![\w-])(?:min-h|h)-\[([\d.]+)(px|rem)\]/g)];
        for (const c of arbitrarias) {
          const px = c[2] === "rem" ? parseFloat(c[1]) * 16 : parseFloat(c[1]);
          if (px < 44) out.push(`<${m[1]}> con ${c[0]} = ${px} px`);
        }
      }
      return [...new Set(out)];
    },
  },
  {
    id: "botones-en-vez-de-tabs",
    capa: "dura",
    ley: "Ley de Jakob · Modelo mental",
    msg: "3 o más botones que cambian el mismo estado: eso es Tabs o ToggleGroup, no botones",
    check(src) {
      const setters = {};
      const re = /onClick=\{\s*\(\s*\)\s*=>\s*(set[A-Z]\w*)\s*\(/g;
      let m;
      while ((m = re.exec(src))) setters[m[1]] = (setters[m[1]] || 0) + 1;
      return Object.entries(setters)
        .filter(([, n]) => n >= 3)
        .map(([s, n]) => `${n} botones llaman a ${s}()`);
    },
  },
  {
    id: "async-sin-estado",
    capa: "dura",
    ley: "Umbral de Doherty",
    msg: "hay await pero ningún estado de espera; el usuario no sabe si pulsó",
    check(src) {
      if (!/\bawait\s/.test(src)) return [];
      if (/\b(isLoading|isPending|loading|pending|isSubmitting|Skeleton|Spinner|useTransition)\b/.test(src)) return [];
      return ["await sin isLoading/isPending/Skeleton"];
    },
  },
  {
    id: "lista-sin-vacio",
    capa: "contextual",
    ley: "Ley de Tesler · Fluir",
    msg: "lista sin rama de vacío. No aplica si los elementos son fijos y conocidos (por ejemplo, 3 pestañas)",
    check(src) {
      if (!/\.map\(/.test(src)) return [];
      if (/\.length\s*===?\s*0|\.length\s*\?|!\w+\.length|EmptyState|Empty\b|vacio|vacío/i.test(src)) return [];
      return [".map( sin rama para lista vacía"];
    },
  },
];

function* walk(p) {
  // Un symlink roto o un directorio sin permiso NO puede tumbar el gate:
  // un gate que rompe el build por el motivo equivocado acaba desactivado.
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isFile()) { if (EXT.test(p) && !PRUEBA.test(p)) yield p; return; }
  let entradas;
  try { entradas = readdirSync(p); } catch { return; }
  for (const e of entradas) {
    if (SALTAR.has(e) || e.startsWith(".")) continue;
    yield* walk(join(p, e));
  }
}

let duras = 0, contextuales = 0;
const ficheros = new Set();
for (const t of targets) {
  for (const file of walk(t)) {
    const src = readFileSync(file, "utf8");
    for (const r of REGLAS) {
      // Excepción de FICHERO: solo para reglas de fichero. Las de elemento
      // filtran ellas mismas, por proximidad.
      if (r.alcance !== "elemento" && permite(r.id).test(src)) continue;
      const hits = r.check(src, file);
      if (!hits.length) continue;
      const etq = r.capa === "dura" ? "DURA" : "contexto";
      console.log(`\n[${etq}] ${r.id} — ${r.msg}\n  ley: ${r.ley}`);
      for (const h of hits) console.log(`  ${relative(process.cwd(), file)}  ${h}`);
      if (r.capa === "dura") duras += hits.length; else contextuales += hits.length;
      ficheros.add(file);
    }
  }
}

if (!duras && !contextuales) { console.log("✓ leyes: sin infracciones"); process.exit(0); }
console.log(`\n${duras} dura(s) y ${contextuales} contextual(es) en ${ficheros.size} fichero(s).`);
if (contextuales && !ESTRICTO) {
  console.log("Las contextuales NO fallan: se deciden con el contexto del producto.");
  console.log("Si ya se decidió que aquí no aplican, anótalo con `// leyes:allow <id> <motivo>`.");
}
if (REPORT) process.exit(0);
process.exit(duras || (ESTRICTO && contextuales) ? 1 : 0);
