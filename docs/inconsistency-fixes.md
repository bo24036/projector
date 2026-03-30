# Inconsistency Fix Tracker

Found via codebase audit against CLAUDE.md rules. Working through these one at a time.

---

## Status

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | `display: contents` (banned, no approval) | styles/layout.css:529,533,557 | ✅ DONE |
| 2 | Date formatting logic in dumb component | src/ui/components/ProjectDetail.js | ✅ DONE |
| 3 | String manipulation in dumb component | src/ui/components/NoteListItem.js | ✅ DONE |
| 4 | Local mutable state in dumb component | src/ui/components/SuppressNamesModal.js | ✅ DONE |
| 5 | Magic value `5000` (auto-dismiss timeout) | src/state.js:105 | ✅ DONE |

---

## Issue Details

### 1 — `display: contents` in layout.css
**Rule:** Banned. Requires explicit user approval before use.
**Where:** `.project-detail__header-left` (L529), `.project-detail__header-right` (L533), `.project-detail__metadata` (L557)
**Fix:** Investigate what layout problem each solves, then decide: approve with a comment explaining why, or rework the layout without it.

### 2 — Date formatting logic in ProjectDetail.js
**Rule:** Dumb components must have ZERO logic/string manipulation. Formatting belongs in connectors or Domain Queries.
**Where:** Local `formatISODate()` function defined and called within the template for `project.createdAt` and `project.archivedAt`.
**Fix:** Move `formatISODate` to a Domain Query in `src/domains/Project.js` (or a shared date util), call it in the connector before passing display values to the component.

### 3 — String slicing in NoteListItem.js
**Rule:** Same as above — no string manipulation in components.
**Where:** `note.content.slice(0, 40)` inside the delete confirmation dialog.
**Fix:** Pre-truncate in the connector (or a Note Domain Query) and pass the truncated string as a prop.

### 4 — Local mutable state in SuppressNamesModal.js
**Rule:** Components are dumb templates. State mutations and local state machines belong in handlers/state.
**Where:** `const selection = new Set(suppressedNames)` and `let reviewDays = holdReviewDays` mutated by local event handlers before `onSave` fires.
**Fix options (decide when working on it):**
- A: Lift state into the dispatcher — each checkbox/input change dispatches an action, handler tracks pending selection, Save dispatches SAVE_SUPPRESSED_NAMES.
- B: If the modal is always transient and the multi-step local state is intentional (user can cancel), document this as an approved exception in an ADR.

### 5 — Magic value `5000` in state.js
**Rule:** No bare values; use named constants.
**Where:** `setTimeout(() => { ... }, 5000)` — auto-dismiss error toast.
**Fix:** Extract `const AUTO_DISMISS_MS = 5000;` at the top of state.js (or in a constants file) and reference it.

---

## Notes
- Start with the easiest/lowest-risk fix (#5) to warm up, then tackle the layout questions (#1), then the component logic issues (#2, #3, #4).
- Issue #4 (SuppressNamesModal) needs a design decision before coding — discuss first.
