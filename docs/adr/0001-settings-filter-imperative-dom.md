# ADR 0001: Imperative DOM Filtering in Settings Modal

## Context

The Settings modal includes a filter input for the "Suppress from Autocomplete" name list. As the user types, only matching names should be visible. The standard UDF pattern would route each keystroke through `dispatch → handler → setState → rAF → re-render`. This raises a tension: the filter value is transient UI state with no meaning outside the modal, and putting it in app state pollutes the state shape with a throwaway string that requires cleanup on modal close.

Debouncing was considered as a way to reduce pipeline pressure, but debouncing a filter input introduces a perceptible lag that degrades the user experience — particularly for a short list where instant feedback is expected and achievable.

## Decision

The filter handler directly manipulates `li.hidden` on already-rendered DOM nodes via `querySelectorAll`. It does not dispatch, does not modify app state, and does not re-render. The DOM manipulation is scoped entirely to the modal's filter interaction.

## Rationale

- The filter changes *visibility* of already-rendered nodes, not data or derived state. This is closer in nature to a CSS class toggle than a state mutation.
- The name list is small (personal use, tens of names at most). Full re-renders on every keystroke are unnecessary overhead for this scale.
- Keeping `settingsFilter` out of app state preserves the state shape contract: only ephemeral flags and entity IDs.
- The alternative (debounce + dispatch) adds pipeline complexity and perceptible lag with no benefit at this scale.

## Consequences

- `SuppressNamesModal` is not a pure dumb component — it contains an imperative event handler that touches the DOM directly. This is a narrow, contained exception to the dumb component rule.
- Future developers should not use this pattern as a general precedent for skipping the UDF pipeline. It applies specifically to within-render visibility toggling on small, already-rendered lists.
