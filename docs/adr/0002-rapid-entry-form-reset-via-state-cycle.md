# ADR 0002: Rapid-entry form reset via state cycle effect

## Context

After saving a task, note, or person via the inline create form, the form should clear and refocus so the user can immediately enter another item. The form is a dumb component rendered by a connector based on a `creatingX` boolean in state.

lit-html reuses DOM nodes across renders and tracks the last value it set on property bindings (`.value`). When the user types into an input, the DOM property changes but lit-html's internal record does not. Passing `''` on the next render looks like "no change" to lit-html, so the DOM is not updated and the old text remains.

## Decision

On a successful `CREATE_*` action, the handler sets `creatingX: false` and returns an effect that dispatches `START_CREATE_*`. This causes two renders: one where the placeholder replaces the form (node destroyed), and one where the fresh form replaces the placeholder (new node, blank inputs).

## Rationale

- The only reliable way to clear inputs in vanilla lit-html without directives is node recreation — passing a new value to a `.value` binding is silently ignored when lit-html's cached value matches.
- Two genuine state transitions are occurring: "close form after save" and "reopen form for next entry." The effect models the second transition as a consequence of the first.
- `START_CREATE_*` handlers have no effects, so there is no cycle risk.

## Consequences

- This is an exception to the principle that effects should not exist solely to dispatch. It is tolerable here because the two dispatches model real state transitions and the terminal handler has no effects.
- We should not generalize this pattern. Any future use of "effect that dispatches" should reference this ADR and justify why node recreation is necessary.
- If we ever adopt a lit-html version with the `keyed` directive, this workaround can be replaced with `keyed(id, template)` and the effect removed.
