# ADR 0002: Rapid-entry form reset via connector DOM sync

## Context

After saving a task, note, or person via the inline create form, the form should clear and refocus so the user can immediately enter another item.

lit-html reuses DOM nodes across renders and tracks the last value it set on property bindings (`.value`). When the user types into an input, the DOM property changes but lit-html's internal record does not. Passing `''` on the next render looks like "no change" to lit-html, so the DOM is not updated and the old text remains.

## Decision

In each connector's `onSave` callback, before dispatching `CREATE_*`, explicitly zero the input values via `document.querySelectorAll('.entity--creating input').forEach(el => { el.value = ''; })`. The handler keeps `creatingX: true` so the form node is preserved and refocused. lit-html renders with its cached `''` values, which now match the DOM, so no update is needed and the fields stay blank.

## Rationale

- This is a deliberate one-time DOM sync to correct drift caused by user input — the same category as the autofocus `.focus()` call already present in the app.
- It is done in the connector (not a dumb component or handler), which has full knowledge of the save action and the form's DOM structure.
- It avoids the double-render hack (cycling `creatingX` false→true across two rAF frames), which was complex, fragile, and an abuse of the effect system.
- The selector is scoped to the `--creating` modifier class, limiting blast radius.

## Consequences

- Direct DOM mutation in a connector callback. Acceptable here because it is correcting framework-invisible drift, not computing or transforming data.
- If the BEM class for the creating form changes, this selector must be updated alongside it.
