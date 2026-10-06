---
name: code-quality-gate
description: Enforce Next.js 16 App Router strictness, the zero-magic-values rule, strict TypeScript safety and clean component layering. Use before finishing any change to app, components, features or styles.
---

# Code quality gate

Pairs with the `code-quality-auditor` agent.

## Procedure
1. Run the gate: `npm run check` runs typecheck, lint, production build and all e2e tests in order (`npm run typecheck`, `npm run lint`, `npm run build`, `npm test`).
2. Review against the rules:
   - **No raw values in TSX.** Colours, spacing, type sizes, radii and timings come from tokens in `styles/tokens/*.css` or Tailwind variables. Flag things like an arbitrary `17px` or a hex code inside a class.
   - **Server and client boundaries.** Keep pages and layouts as server components; add `"use client"` only where state or events need it. Guard against hydration mismatches.
   - **Layering.** `app/` holds routes, `features/` holds self-contained feature modules (calendar, gallery, listing-actions, sticky-nav), `components/` holds shared UI.
   - **Strict TypeScript.** No `any`, no unchecked casts.
3. This repo follows Next.js 16 conventions that differ from older releases; check `node_modules/next/dist/docs/` before changing an API (see `AGENTS.md`).

## Output
A list of violations with file and line, and the token or type that should replace each.
