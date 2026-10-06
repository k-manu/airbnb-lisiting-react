# Architecture

| File | What it is |
| --- | --- |
| [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) | The reasoning: scale assumptions, per-area scaling strategy, request flows, double-booking prevention, failure modes, trade-offs |
| [`architecture-diagram.png`](architecture-diagram.png) | The high-level diagram (frontend, backend, storage, search, deployment) |
| [`architecture-diagram.excalidraw`](architecture-diagram.excalidraw) | Editable source; open at [excalidraw.com](https://excalidraw.com) |
| [`architecture-diagram.svg`](architecture-diagram.svg) | Vector export |

The diagram is generated from a single spec: `node scripts/architecture/build-diagram.mjs`.
