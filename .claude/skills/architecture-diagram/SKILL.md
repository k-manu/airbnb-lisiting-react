---
name: architecture-diagram
description: Design and document the production-scale cloud architecture for a vacation-rental marketplace, with a high-level Excalidraw diagram covering frontend, backend, storage, search and deployment scaling. Use when creating or revising anything in architecture/.
---

# Architecture diagram and design doc

Pairs with the `system-architect` agent.

## Procedure
1. Fix the design point first (users, listings, read:write ratio, peak QPS and bookings/s, regions, SLOs). Every number must agree across the diagram, `architecture/SYSTEM_DESIGN.md` and `PROMPTS.md`.
2. Cover the five required areas, each with a visible scaling strategy: frontend, backend, storage, search, deployment. Also show edge and async events, and the hard problems: double-booking prevention (lock plus optimistic concurrency plus idempotent payment, with the reservation state machine), the read-heavy path, media processing and failover.
3. Edit the spec in `scripts/architecture/build-diagram.mjs`, then run `node scripts/architecture/build-diagram.mjs`. It writes the editable `architecture-diagram.excalidraw`, an `.svg` and a `.png` into `architecture/`. `--compact` uses the smaller text; pair it with `--out=<dir>` so it does not overwrite the submission files.
4. Open the `.excalidraw` in excalidraw.com to check it. If the PNG is re-exported from Excalidraw, do not run the generator again afterwards, or the export is overwritten.
5. Update `architecture/SYSTEM_DESIGN.md` so it explains every box and arrow on the diagram, including trade-offs and failure modes.

## Output
The diagram files plus a design doc whose numbers match the diagram.
