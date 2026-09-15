import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// GATE se puede cambiar para correr la suite contra otra versión del script.
const GATE = process.env.GATE ??
  join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "leyes-ux", "scripts", "check-leyes.mjs");

const raiz = mkdtempSync(join(tmpdir(), "check-leyes-"));
after(() => rmSync(raiz, { recursive: true, force: true }));

let n = 0;
/** Crea un proyecto de prueba en su propia carpeta y devuelve la ruta. */
function proyecto(ficheros) {
  const dir = join(raiz, String(n++));
  for (const [rel, src] of Object.entries(ficheros)) {
    const p = join(dir, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, src);
  }
  return dir;
}

function gate(...args) {
  const r = spawnSync(process.execPath, [GATE, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
}

const comp = (jsx) => `export default function Comp() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}\n`;
const TOKENS = "@theme {\n  --spacing-control: 2.5rem;\n  --spacing-touch: 2.75rem;\n  --spacing-icon: 1rem;\n}\n";

test("objetivo-pequeno: h-9 literal (36 px) falla", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`<button className="h-9">x</button>`) }));
  assert.equal(code, 1);
  assert.match(out, /objetivo-pequeno/);
  assert.match(out, /h-9/);
});

test("objetivo-pequeno: min-h-11 (44 px) cumple", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`<button className="min-h-11">x</button>`) }));
  assert.equal(code, 0);
  assert.match(out, /sin infracciones/);
});

test("objetivo-pequeno: un token --spacing de 40 px se resuelve contra el CSS y falla", () => {
  const dir = proyecto({ "src/App.tsx": comp(`<button className="min-h-control">x</button>`), "src/styles/tokens.css": TOKENS });
  const { code, out } = gate(dir);
  assert.equal(code, 1);
  assert.match(out, /min-h-control = 40 px/);
});

test("objetivo-pequeno: un token --spacing de 44 px cumple", () => {
  const dir = proyecto({ "src/App.tsx": comp(`<button className="min-h-touch">x</button>`), "src/styles/tokens.css": TOKENS });
  assert.equal(gate(dir).code, 0);
});

test("objetivo-pequeno: size-* en un hijo mide el glifo, no el objetivo", () => {
  const dir = proyecto({
    "src/App.tsx": comp(`<button className="min-h-11">\n  <Icon className="size-icon" />\n</button>`),
    "src/styles/tokens.css": TOKENS,
  });
  const { code, out } = gate(dir);
  assert.equal(code, 0);
  assert.match(out, /sin infracciones/);
});

test("objetivo-pequeno: size-8 en la etiqueta raíz falla", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`<button className="size-8">x</button>`) }));
  assert.equal(code, 1);
  assert.match(out, /size-8/);
});

test("objetivo-pequeno: una flecha => en onClick no corta la etiqueta", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`<button onClick={() => go()} className="size-8">x</button>`) }));
  assert.equal(code, 1);
  assert.match(out, /size-8/);
});

test("objetivo-pequeno: valores arbitrarios en px y rem", () => {
  const pequeno = gate(proyecto({ "src/App.tsx": comp(`<a href="/x" className="h-[40px]">x</a>`) }));
  assert.equal(pequeno.code, 1);
  assert.match(pequeno.out, /h-\[40px\] = 40 px/);
  const valido = gate(proyecto({ "src/App.tsx": comp(`<a href="/x" className="min-h-[2.75rem]">x</a>`) }));
  assert.equal(valido.code, 0);
});

test("leyes:allow con motivo silencia el elemento", () => {
  const jsx = `<button className="h-9">x</button>\n{/* leyes:allow objetivo-pequeno es un chip decorativo */}`;
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx) }));
  assert.equal(code, 0);
  assert.match(out, /sin infracciones/);
});

test("leyes:allow sin motivo no cuenta", () => {
  const jsx = `<button className="h-9">x</button>\n{/* leyes:allow objetivo-pequeno */}`;
  assert.equal(gate(proyecto({ "src/App.tsx": comp(jsx) })).code, 1);
});

test("leyes:allow es del elemento: no tapa al botón vecino", () => {
  const jsx = `<button className="h-9">chip</button>\n{/* leyes:allow objetivo-pequeno es un chip decorativo */}\n<button className="h-8">sin excepción</button>`;
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx) }));
  assert.equal(code, 1);
  assert.match(out, /h-8/);
  assert.doesNotMatch(out, /h-9/);
});

test("async-sin-estado: await sin estado de espera falla", () => {
  const src = `export default function Comp() {\n  async function load() {\n    await fetch("/x");\n  }\n  return <button onClick={load}>cargar</button>;\n}\n`;
  const { code, out } = gate(proyecto({ "src/App.tsx": src }));
  assert.equal(code, 1);
  assert.match(out, /async-sin-estado/);
});

test("async-sin-estado: con estado de carga cumple", () => {
  const src = `import { useState } from "react";\nexport default function Comp() {\n  const [loading] = useState(false);\n  async function load() {\n    await fetch("/x");\n  }\n  return <button onClick={load}>cargar</button>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 0);
});

test("botones-en-vez-de-tabs: 3 botones sobre el mismo estado fallan", () => {
  const jsx = ["a", "b", "c"].map((v) => `<button className="min-h-11" onClick={() => setVista("${v}")}>${v}</button>`).join("\n");
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx) }));
  assert.equal(code, 1);
  assert.match(out, /3 botones llaman a setVista\(\)/);
});

test("primario-multiple: contextual no falla salvo con --estricto", () => {
  const dir = proyecto({ "src/App.tsx": comp(`<Button variant="primary">A</Button>\n<Button variant="primary">B</Button>`) });
  const normal = gate(dir);
  assert.equal(normal.code, 0);
  assert.match(normal.out, /\[contexto\] primario-multiple/);
  assert.equal(gate("--estricto", dir).code, 1);
});

test("acento-sin-racionar: más de 4 usos avisa", () => {
  const jsx = Array.from({ length: 5 }, () => `<div className="bg-primary">x</div>`).join("\n");
  assert.match(gate(proyecto({ "src/App.tsx": comp(jsx) })).out, /acento-sin-racionar/);
});

test("acento-sin-racionar: text-primary-foreground no es un uso del acento", () => {
  const jsx = Array.from({ length: 3 }, () => `<div className="bg-primary text-primary-foreground">x</div>`).join("\n");
  assert.doesNotMatch(gate(proyecto({ "src/App.tsx": comp(jsx) })).out, /acento-sin-racionar/);
});

test("lista-sin-vacio: .map sin rama de vacío avisa sin fallar", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`{items.map((i) => <p key={i}>{i}</p>)}`) }));
  assert.equal(code, 0);
  assert.match(out, /\[contexto\] lista-sin-vacio/);
});

test("--report no falla nunca", () => {
  assert.equal(gate("--report", proyecto({ "src/App.tsx": comp(`<button className="h-9">x</button>`) })).code, 0);
});

test("los ficheros de test no se analizan", () => {
  const { code, out } = gate(proyecto({ "src/x.test.tsx": comp(`<button className="h-9">x</button>`) }));
  assert.equal(code, 0);
  assert.match(out, /sin infracciones/);
});

test("sin argumentos sale con 2 y enseña el uso", () => {
  const { code, out } = gate();
  assert.equal(code, 2);
  assert.match(out, /uso:/);
});

test("--help sale con 0 y enseña el uso", () => {
  const { code, out } = gate("--help");
  assert.equal(code, 0);
  assert.match(out, /uso:/);
});
