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

function hook(entrada) {
  const input = typeof entrada === "string" ? entrada : JSON.stringify(entrada);
  const r = spawnSync(process.execPath, [GATE, "--hook"], { encoding: "utf8", input });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

// El JSX de `comp` empieza en la línea 4 del fichero.
const comp = (jsx) => `export default function Comp() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}\n`;
const TOKENS = "@theme {\n  --spacing-control: 2.5rem;\n  --spacing-touch: 2.75rem;\n  --spacing-icon: 1rem;\n}\n";

// --- objetivo-pequeno ---

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

test("objetivo-pequeno: size-8 en la etiqueta falla", () => {
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(`<button className="size-8">x</button>`) }));
  assert.equal(code, 1);
  assert.match(out, /size-8/);
});

test("objetivo-pequeno: <Button> y <Link> cuentan igual que <button> y <a>", () => {
  const boton = gate(proyecto({ "src/App.tsx": comp(`<Button className="h-8">Guardar</Button>`) }));
  assert.equal(boton.code, 1);
  assert.match(boton.out, /<Button> con h-8/);
  const enlace = gate(proyecto({ "src/App.tsx": comp(`<Link href="/" className="h-8">Inicio</Link>`) }));
  assert.equal(enlace.code, 1);
});

test("objetivo-pequeno: un icono con nombre de enlace que se cierra solo no es un objetivo", () => {
  const jsx = `<ExternalLink className="h-4 w-4" />\n<Link className="h-4 w-4" />`;
  assert.equal(gate(proyecto({ "src/App.tsx": comp(jsx) })).code, 0);
});

test("objetivo-pequeno: las alturas de los hijos no son la altura del objetivo", () => {
  const jsx = [
    `<button className="min-h-11 px-4"><Icon className="h-4 w-4" /> Guardar</button>`,
    `<button className="px-4 py-2">\n  <svg className="h-4 w-4" /> Borrar\n</button>`,
    `<button className="min-h-11">\n  <Icon className="size-icon" />\n</button>`,
  ].join("\n");
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx), "src/styles/tokens.css": TOKENS }));
  assert.equal(code, 0);
  assert.match(out, /sin infracciones/);
});

test("objetivo-pequeno: un <button /> que se cierra solo no se queda con las clases de después", () => {
  const jsx = `<button aria-label="Cerrar" className="min-h-11" />\n<div className="h-8">contenido</div>`;
  assert.equal(gate(proyecto({ "src/App.tsx": comp(jsx) })).code, 0);
});

test("objetivo-pequeno: variantes de otro elemento, de escritorio y max-h no cuentan", () => {
  const jsx = [
    `<button className="min-h-11 gap-2 [&_svg]:size-4">a</button>`,
    `<button className="min-h-11 max-h-10">b</button>`,
    `<button className="h-11 sm:h-9">c</button>`,
  ].join("\n");
  assert.equal(gate(proyecto({ "src/App.tsx": comp(jsx) })).code, 0);
});

test("objetivo-pequeno: ni una flecha => ni un > dentro de una clase cortan la etiqueta", () => {
  const flecha = gate(proyecto({ "src/App.tsx": comp(`<button onClick={() => go()} className="size-8">x</button>`) }));
  assert.equal(flecha.code, 1);
  assert.match(flecha.out, /size-8/);
  const clase = gate(proyecto({ "src/App.tsx": comp(`<button className="[&>svg]:size-4 h-9">x</button>`) }));
  assert.equal(clase.code, 1);
  assert.match(clase.out, /h-9/);
});

test("objetivo-pequeno: valores arbitrarios en px y rem", () => {
  const pequeno = gate(proyecto({ "src/App.tsx": comp(`<a href="/x" className="h-[40px]">x</a>`) }));
  assert.equal(pequeno.code, 1);
  assert.match(pequeno.out, /h-\[40px\] = 40 px/);
  const valido = gate(proyecto({ "src/App.tsx": comp(`<a href="/x" className="min-h-[2.75rem]">x</a>`) }));
  assert.equal(valido.code, 0);
});

// --- excepciones ---

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

test("leyes:allow con // y nada detrás no toma la línea siguiente como motivo", () => {
  const src = `// leyes:allow async-sin-estado\nexport default function C() {\n  async function f() { await fetch("/x"); }\n  return <button className="min-h-11" onClick={f}>x</button>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 1);
});

test("leyes:allow de fichero con motivo en la misma línea silencia la regla", () => {
  const src = `// leyes:allow async-sin-estado el estado de espera vive en el padre\nexport default function C() {\n  async function f() { await fetch("/x"); }\n  return <button className="min-h-11" onClick={f}>x</button>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 0);
});

test("leyes:allow es del elemento: no tapa al botón vecino", () => {
  const jsx = `<button className="h-9">chip</button>\n{/* leyes:allow objetivo-pequeno es un chip decorativo */}\n<button className="h-8">sin excepción</button>`;
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx) }));
  assert.equal(code, 1);
  assert.match(out, /h-8/);
  assert.doesNotMatch(out, /h-9/);
});

// --- async-sin-estado ---

test("async-sin-estado: await tras un clic sin estado de espera falla", () => {
  const src = `export default function Comp() {\n  async function load() {\n    await fetch("/x");\n  }\n  return <button onClick={load}>cargar</button>;\n}\n`;
  const { code, out } = gate(proyecto({ "src/App.tsx": src }));
  assert.equal(code, 1);
  assert.match(out, /async-sin-estado/);
});

test("async-sin-estado: con estado de carga cumple", () => {
  const src = `import { useState } from "react";\nexport default function Comp() {\n  const [loading] = useState(false);\n  async function load() {\n    await fetch("/x");\n  }\n  return <button onClick={load}>cargar</button>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 0);
});

test("async-sin-estado: un server component sin interacción no cuenta", () => {
  const src = `export default async function Page() {\n  const posts = await getPosts();\n  return <ul>{posts.length === 0 ? <p>Vacío</p> : posts.map((p) => <li key={p.id}>{p.t}</li>)}</ul>;\n}\n`;
  assert.equal(gate(proyecto({ "app/page.tsx": src })).code, 0);
});

test("async-sin-estado: un form con action y sin estado de envío falla", () => {
  const src = `export default function Page() {\n  async function crear(fd) {\n    "use server";\n    await guardar(fd);\n  }\n  return <form action={crear}><input name="t" /><button className="min-h-11">Crear</button></form>;\n}\n`;
  assert.equal(gate(proyecto({ "app/page.tsx": src })).code, 1);
});

test("async-sin-estado: useOptimistic cuenta como feedback", () => {
  const src = `import { useOptimistic } from "react";\nexport default function C({ items }) {\n  const [lista, add] = useOptimistic(items);\n  async function f() { add("x"); await fetch("/x"); }\n  return <button className="min-h-11" onClick={f}>Añadir</button>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 0);
});

test("async-sin-estado: loading=\"lazy\" no es un estado de espera", () => {
  const src = `export default function C() {\n  async function f() { await fetch("/x"); }\n  return <div><img loading="lazy" src="/a.png" /><button className="min-h-11" onClick={f}>Enviar</button></div>;\n}\n`;
  assert.equal(gate(proyecto({ "src/App.tsx": src })).code, 1);
});

// --- botones-en-vez-de-tabs ---

test("botones-en-vez-de-tabs: 3 botones con valores distintos del mismo estado fallan", () => {
  const jsx = ["a", "b", "c"].map((v) => `<button className="min-h-11" onClick={() => setVista("${v}")}>${v}</button>`).join("\n");
  const { code, out } = gate(proyecto({ "src/App.tsx": comp(jsx) }));
  assert.equal(code, 1);
  assert.match(out, /3 botones llaman a setVista\(\)/);
});

test("botones-en-vez-de-tabs: abrir y cerrar no son pestañas", () => {
  const jsx = [
    `<button className="min-h-11" onClick={() => setOpen(true)}>Editar</button>`,
    `<button className="min-h-11" onClick={() => setOpen(false)}>Cancelar</button>`,
    `<button className="min-h-11" onClick={() => setOpen(false)}>Cerrar</button>`,
  ].join("\n");
  assert.equal(gate(proyecto({ "src/App.tsx": comp(jsx) })).code, 0);
});

// --- contextuales ---

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

// --- salida ---

test("cada aviso lleva archivo:línea", () => {
  const { out } = gate(proyecto({ "src/App.tsx": comp(`<p>hola</p>\n<button className="h-9">x</button>`) }));
  assert.match(out, /App\.tsx:5\s+<button> con h-9/);
});

test("--json devuelve fichero, línea, regla y capa", () => {
  const { code, out } = gate("--json", proyecto({ "src/App.tsx": comp(`<button className="h-9">x</button>`) }));
  assert.equal(code, 1);
  const [h] = JSON.parse(out);
  assert.equal(h.regla, "objetivo-pequeno");
  assert.equal(h.capa, "dura");
  assert.equal(h.linea, 4);
  assert.match(h.fichero, /App\.tsx$/);
});

test("--report no falla nunca", () => {
  assert.equal(gate("--report", proyecto({ "src/App.tsx": comp(`<button className="h-9">x</button>`) })).code, 0);
});

test("los ficheros de test no se analizan", () => {
  const dir = proyecto({ "src/x.test.tsx": comp(`<button className="h-9">x</button>`), "src/App.tsx": comp(`<p>ok</p>`) });
  const { code, out } = gate(dir);
  assert.equal(code, 0);
  assert.match(out, /sin infracciones en 1 fichero/);
});

// --- mal uso ---

test("sin argumentos sale con 2 y enseña el uso", () => {
  const { code, out } = gate();
  assert.equal(code, 2);
  assert.match(out, /uso:/);
});

test("una ruta que no existe sale con 2", () => {
  const { code, out } = gate(join(raiz, "no-existe"));
  assert.equal(code, 2);
  assert.match(out, /no existe/);
});

test("un flag desconocido sale con 2", () => {
  const { code, out } = gate("--strict", proyecto({ "src/App.tsx": comp(`<p>ok</p>`) }));
  assert.equal(code, 2);
  assert.match(out, /flag desconocido: --strict/);
});

test("una ruta sin ningún .jsx ni .tsx sale con 2", () => {
  assert.equal(gate(proyecto({ "README.md": "# nada" })).code, 2);
});

test("--help sale con 0 y enseña el uso", () => {
  const { code, out } = gate("--help");
  assert.equal(code, 0);
  assert.match(out, /uso:/);
});

// --- hook ---

test("--hook: una regla dura en el fichero editado sale con 2 y la cuenta por stderr", () => {
  const dir = proyecto({ "src/App.tsx": comp(`<button className="h-9">x</button>`) });
  const r = hook({ hook_event_name: "PostToolUse", tool_name: "Write", tool_input: { file_path: join(dir, "src/App.tsx") } });
  assert.equal(r.code, 2);
  assert.match(r.err, /objetivo-pequeno/);
  assert.match(r.err, /línea 4/);
});

test("--hook: solo contextuales sale con 0 y en silencio", () => {
  const dir = proyecto({ "src/App.tsx": comp(`<Button variant="primary">A</Button>\n<Button variant="primary">B</Button>`) });
  const r = hook({ tool_input: { file_path: join(dir, "src/App.tsx") } });
  assert.equal(r.code, 0);
  assert.equal(r.err, "");
});

test("--hook: otro tipo de fichero, una ruta que no existe o un JSON roto salen con 0", () => {
  const dir = proyecto({ "README.md": "# x" });
  assert.equal(hook({ tool_input: { file_path: join(dir, "README.md") } }).code, 0);
  assert.equal(hook({ tool_input: { file_path: join(dir, "no-existe.tsx") } }).code, 0);
  assert.equal(hook("esto no es json").code, 0);
});
