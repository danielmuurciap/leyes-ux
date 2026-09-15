---
description: La crítica tiene que encontrar los tres fallos plantados, cada uno con su arreglo.
tags: [criticar]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Revisa la UX de este componente y dime qué cambiarías:

```tsx
export default function Galeria({ fotos }) {
  const [vista, setVista] = useState("lista");
  async function guardar() {
    await fetch("/api/favoritos", { method: "POST" });
  }
  return (
    <div>
      <div className="flex gap-1">
        <button className="h-8 px-2" onClick={() => setVista("lista")}>Lista</button>
        <button className="h-8 px-2" onClick={() => setVista("mapa")}>Mapa</button>
        <button className="h-8 px-2" onClick={() => setVista("fotos")}>Fotos</button>
      </div>
      {fotos.map((f) => <img key={f.id} src={f.url} />)}
      <button className="h-8 px-2 bg-primary" onClick={guardar}>Guardar favoritos</button>
    </div>
  );
}
```
