# Project structure

Full annotated tree: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).
Quick map: `browse/` gstack's own headless-browser CLI (the fallback
engine) plus the `/browse` skill, `design/` design binary, `make-pdf/` PDF
binary, `hosts/` typed host configs, `scripts/` build+DX tooling
(gen-skill-docs, resolvers — `resolvers/aside.ts` is the Aside contract),
`test/` validation+evals, `lib/` shared libraries (`aside-render.ts` renders
local HTML through Aside, falling back to the engine; `design-catalog.ts` is
the typed design anti-pattern catalog every design skill renders from), `bin/`
CLI utilities (`gstack-render.ts` is the render CLI skills call;
`gstack-design-detect.ts` and `gstack-design-md.ts` are the design detector
and open-DESIGN.md tools), `extension/` Chrome
extension, one directory per skill (`ship/`, `review/`, `qa/`, ...),
`.github/` CI, `contrib/` contributor tools, `docs/designs/` design documents.
