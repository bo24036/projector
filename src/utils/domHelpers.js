/**
 * Focuses the first [data-autofocus] element in a container after the current render cycle.
 * Call after every render — if no autofocus element exists, the query returns null harmlessly.
 *
 * @param {Element} container
 */
export function focusAutofocusElement(container) {
  requestAnimationFrame(() => {
    container.querySelector('[data-autofocus]')?.focus();
  });
}
