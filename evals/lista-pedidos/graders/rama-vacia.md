---
type: regex
pattern: '\.length\s*===?\s*0|!\s*\w+\??\.length|\.length\s*[?&]|EmptyState|no hay pedidos|todavía no|aún no|sin pedidos'
flags: i
target: { source: file, path: src/Pedidos.tsx }
weight: 2
---
