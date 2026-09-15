---
description: Una acción que espera a la red tiene que enseñar un estado de espera mientras tanto (Doherty).
tags: [construir, espera]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Crea `src/GuardarBorrador.tsx`: un botón en React con Tailwind que guarda el borrador llamando a `await fetch("/api/borrador", { method: "POST" })`. Solo ese fichero; no instales dependencias ni crees más ficheros.
