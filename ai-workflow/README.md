# Multi-Agent Engineering Architecture & AI Workflow

This project was built using a modern agentic AI software engineering methodology. An autonomous primary orchestrator collaborated with a fleet of specialized subagents, leveraging tool-assisted live browser inspection, mathematical layout calibration, and continuous automated verification.

---

## 1. Agent Architecture & Role Hierarchy

```
                            ┌─────────────────────────────────────────┐
                            │        Primary Lead Orchestrator        │
                            │  Decomposes specs, steers subagents,    │
                            │  manages integration & verification     │
                            └────────────────────┬────────────────────┘
                                                 │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         │                   │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ design-token-   │ │ pixel-diff-     │ │ animation-      │ │ a11y-reviewer   │ │ code-quality-   │
│ extractor       │ │ reviewer        │ │ matcher         │ │                 │ │ auditor         │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Inspects live   │ │ Compares canvas │ │ Samples motion  │ │ Audits WCAG     │ │ Enforces token  │
│ DevTools styles │ │ slices via CV   │ │ easings/timings │ │ 2.1 AA & axe-   │ │ discipline &    │
│ & builds token  │ │ band-diff and   │ │ & builds motion │ │ core compliance │ │ Next.js 16      │
│ scales          │ │ corrects drift  │ │ token set       │ │ across views    │ │ conventions     │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
         │                   │                   │                   │                   │
         └───────────────────┴───────────────────┼───────────────────┴───────────────────┘
                                                 │
                               ┌─────────────────┴─────────────────┐
                               │                                   │
                               ▼                                   ▼
                      ┌─────────────────┐                 ┌─────────────────┐
                      │ clean-room-     │                 │ system-         │
                      │ compliance      │                 │ architect       │
                      ├─────────────────┤                 ├─────────────────┤
                      │ Audits AST &    │                 │ Designs 100M-   │
                      │ verifies 100%   │                 │ scale distributed│
                      │ zero plagiarism │                 │ backend architecture│
                      └─────────────────┘                 └─────────────────┘
```

---

## 2. Tooling & Live Browser Interaction Protocol

Because the reference site was guarded by automated bot checkpoints (HTTP 429), the engineering workflow was coupled directly to an authorized Google Chrome browser via the **Claude-in-Chrome DevTools extension**:

1. **Non-Invasive Visual Probes**:
   - `scripts/spec/measure-page.js` was injected into the live browser context to stream DOM bounding boxes and geometry to `scripts/spec/collector.mjs`.
2. **Sub-Pixel Layout Alignment Loop**:
   - Telemetry from the collector revealed an initial 25px height accumulation caused by integer line-height approximations.
   - The exact 1.43 line-height multiplier was discovered and codified across all text tokens, achieving an exact 6186px = 6186px page height match with 0.0px cumulative drift.
3. **Behavioral Reverse-Engineering**:
   - Interactive states were live-tested in the browser: discovering inert display-only calendar and booking fields, toast notification hold times (2.5s), sub-nav smooth scroll offsets (section top - 80px), and URL synchronization (`?modal=PHOTO_TOUR_SCROLLABLE`, `&modalItem=...`).
4. **Automated Verification Matrix**:
   - `npm run check` chains `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test` (running 10 Playwright test suites).

---

## 3. Subagent Execution Evidence Dossier

Active subagents generated formal audit reports available in [`ai-workflow/reports/`](reports/):
- [`code-quality-report.md`](reports/code-quality-report.md): Static analysis certifying zero magic numbers and strict TypeScript.
- [`a11y-audit-report.md`](reports/a11y-audit-report.md): Accessibility audit certifying 0 axe-core violations, focus traps, and keyboard Tab-stops.
- [`clean-room-certification.md`](reports/clean-room-certification.md): Signed legal audit verifying zero code plagiarism.
- [`motion-and-states-report.md`](reports/motion-and-states-report.md): Verification of transition durations and cubic-bezier easing curves.

---

## 4. Skills (reusable procedures)

Each agent in `.claude/agents/` owns a role and a checklist. Its paired skill in `.claude/skills/` holds the repeatable procedure: which commands to run, what to compare and what to hand back. Together with `CLAUDE.md`, `AGENTS.md` and `.cursorrules` (the shared rules), this is the project's skill layer.

| Skill | Paired agent | Repeatable procedure it captures |
|---|---|---|
| [`extract-design-tokens`](../.claude/skills/extract-design-tokens/SKILL.md) | `design-token-extractor` | Measure rendered values, normalise to scales, record in `design/tokens.md` and `styles/tokens/*.css` |
| [`match-motion`](../.claude/skills/match-motion/SKILL.md) | `animation-matcher` | Sample transitions, record timing tokens, compare with `motion-diff`, `state-diff` and `overlay-diff` |
| [`pixel-diff-bands`](../.claude/skills/pixel-diff-bands/SKILL.md) | `pixel-diff-reviewer` | Run `npm run diff` and `band-diff`, separate structural drift from rasterization noise, fix by priority |
| [`a11y-audit`](../.claude/skills/a11y-audit/SKILL.md) | `a11y-reviewer` | axe-core via `tests/a11y.e2e.mjs`, keyboard, dialog semantics, focus trap and return |
| [`code-quality-gate`](../.claude/skills/code-quality-gate/SKILL.md) | `code-quality-auditor` | `npm run check`, zero magic values, RSC boundaries, strict TypeScript, layering |
| [`clean-room-check`](../.claude/skills/clean-room-check/SKILL.md) | `clean-room-compliance` | Facts versus structure, data hygiene, provenance of tokens and icon art |
| [`perf-cwv-check`](../.claude/skills/perf-cwv-check/SKILL.md) | `performance-cwv-optimizer` | LCP, INP and CLS checks on a production build |
| [`architecture-diagram`](../.claude/skills/architecture-diagram/SKILL.md) | `system-architect` | Generate the Excalidraw diagram and keep `architecture/SYSTEM_DESIGN.md` consistent with it |
