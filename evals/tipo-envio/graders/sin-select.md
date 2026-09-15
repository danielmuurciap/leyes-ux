---
type: regex
pattern: '<[sS]elect\b'
match: not_contains
target: { source: file, path: src/TipoEnvio.tsx }
---
