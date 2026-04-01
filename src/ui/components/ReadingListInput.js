import { html, render } from '/vendor/lit-html/lit-html.js';
import { makeDatalistId } from '../../utils/domUtils.js';

// Dumb component for creating or editing a reading list item.
// onSave(content, link, recommendedBy, tags) — tags is an array
// onCancel() — cancel and dismiss
export function ReadingListInput({ onSave, onCancel, recommenderOptions = [], tagOptions = [], initial = {} }) {
  let contentValue = initial.content ?? '';
  let linkValue = initial.link ?? '';
  let recommendedByValue = initial.recommendedBy ?? '';

  // selectedTags: Set of currently applied tag strings
  const selectedTags = new Set(initial.tags ?? []);

  const recommenderListId = makeDatalistId('rl-recommender-list');

  // All known tags = union of tagOptions + any selectedTags not yet in tagOptions
  function allKnownTags() {
    const extra = [...selectedTags].filter(t => !tagOptions.includes(t));
    return [...tagOptions, ...extra];
  }

  function chipsTemplate() {
    return html`
      ${allKnownTags().map(tag => html`
        <label class="reading-list-input__tag-chip ${selectedTags.has(tag) ? 'is-selected' : ''}">
          <input
            type="checkbox"
            class="reading-list-input__tag-checkbox"
            ?checked=${selectedTags.has(tag)}
            @change=${(e) => {
              if (e.target.checked) {
                selectedTags.add(tag);
              } else {
                selectedTags.delete(tag);
              }
              rerenderChips(e.target.closest('.reading-list-input__chips'));
            }}
          />
          ${tag}
        </label>
      `)}
    `;
  }

  function rerenderChips(chipsEl) {
    if (!chipsEl) return;
    render(chipsTemplate(), chipsEl);
  }

  // Commit whatever is in the new-tag input field as chips
  function commitNewTagInput(inputEl) {
    const val = inputEl.value;
    if (!val.trim()) return;
    val.split(',').map(t => t.trim()).filter(Boolean).forEach(t => selectedTags.add(t));
    inputEl.value = '';
    const chipsEl = inputEl.closest('.reading-list-input__tags-region')?.querySelector('.reading-list-input__chips');
    rerenderChips(chipsEl);
  }

  // Collect tags: committed chips + whatever is still pending in the text input
  function collectTags(container) {
    const pending = container?.querySelector('.reading-list-input__new-tag')?.value ?? '';
    pending.split(',').map(t => t.trim()).filter(Boolean).forEach(t => selectedTags.add(t));
    return [...selectedTags];
  }

  function handleSave(e) {
    if (!contentValue.trim()) return;
    const container = e.target.closest('.reading-list-item--editing');
    onSave(contentValue.trim(), linkValue.trim(), recommendedByValue.trim(), collectTags(container));
  }

  function handleKeyDown(event) {
    if (event.target.classList.contains('reading-list-input__new-tag')) return;
    if (event.key === 'Enter' && !event.shiftKey && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      handleSave(event);
    } else if (event.key === 'Escape') {
      onCancel();
    }
  }

  function handleTextareaKeyDown(event) {
    if (event.key === 'Escape') { onCancel(); return; }
    if (event.key === 'Enter' && event.shiftKey) { event.preventDefault(); handleSave(event); }
  }

  return html`
    <div class="reading-list-item reading-list-item--editing" @keydown=${handleKeyDown}>
      <div class="reading-list-input__fields">
        <textarea
          ?autofocus=${true}
          data-autofocus
          class="reading-list-input__field reading-list-input__field--content"
          placeholder="Content (required)..."
          .value=${contentValue}
          @input=${e => { contentValue = e.target.value; }}
          @keydown=${handleTextareaKeyDown}
          rows="2"
        ></textarea>
        <input
          class="reading-list-input__field reading-list-input__field--link"
          type="text"
          placeholder="Link or [label](url)..."
          .value=${linkValue}
          @input=${e => { linkValue = e.target.value; }}
        />
        <input
          class="reading-list-input__field reading-list-input__field--recommended-by"
          type="text"
          placeholder="Recommended by..."
          .value=${recommendedByValue}
          list=${recommenderListId}
          @input=${e => { recommendedByValue = e.target.value; }}
        />
        <datalist id=${recommenderListId}>
          ${recommenderOptions.map(name => html`<option value=${name}></option>`)}
        </datalist>

        <div class="reading-list-input__tags-region">
          <input
            type="text"
            class="reading-list-input__new-tag"
            placeholder="Add tag..."
            @keydown=${(e) => {
              if (e.key === 'Escape') { e.stopPropagation(); onCancel(); return; }
              if (e.key === ',') {
                e.preventDefault();
                commitNewTagInput(e.target);
              }
            }}
            @blur=${(e) => {
              // Skip if focus is moving to the save/cancel buttons — handleSave will collectTags instead
              const related = e.relatedTarget;
              if (related && (related.classList.contains('button-ok') || related.classList.contains('button-cancel'))) return;
              commitNewTagInput(e.target);
            }}
          />
          <div class="reading-list-input__chips">
            ${chipsTemplate()}
          </div>
        </div>
      </div>
      <div class="reading-list-input__controls">
        <button class="button-ok" @click=${handleSave} title="Save">✓</button>
        <button class="button-cancel" @click=${onCancel} title="Cancel">✕</button>
      </div>
    </div>
  `;
}
