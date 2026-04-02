/**
 * Focuses the first [data-autofocus] element in a container after the current render cycle.
 * Skips focus if the user already has focus inside the container — prevents stealing focus
 * from other fields during re-renders triggered while a form is active.
 *
 * @param {Element} container
 */
export function focusAutofocusElement(container) {
  requestAnimationFrame(() => {
    if (container.contains(document.activeElement)) return;
    container.querySelector('[data-autofocus]')?.focus();
  });
}
