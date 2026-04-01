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

  function tagsTemplate() {
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
              rerenderTagRegion(e.target.closest('.reading-list-input__tags-region'));
            }}
          />
          ${tag}
        </label>
      `)}
      <input
        type="text"
        class="reading-list-input__new-tag"
        placeholder="${allKnownTags().length === 0 ? 'Add tag...' : ''}"
        @keydown=${(e) => {
          if (e.key === 'Escape') { e.stopPropagation(); onCancel(); return; }
          if (e.key === ',') {
            e.preventDefault();
            commitNewTag(e.target);
          }
          // Enter and all other keys bubble to parent @keydown for save
        }}
        @blur=${(e) => commitNewTag(e.target)}
      />
    `;
  }

  function rerenderTagRegion(region) {
    if (!region) return;
    render(tagsTemplate(), region);
  }

  function commitNewTag(inputEl) {
    const val = inputEl.value;
    if (!val.trim()) return;
    val.split(',').map(t => t.trim()).filter(Boolean).forEach(t => selectedTags.add(t));
    const region = inputEl.closest('.reading-list-input__tags-region');
    rerenderTagRegion(region);
  }

  function handleSave() {
    if (!contentValue.trim()) return;
    onSave(contentValue.trim(), linkValue.trim(), recommendedByValue.trim(), [...selectedTags]);
  }

  function handleKeyDown(event) {
    // Don't intercept keys from the tag input (it handles its own keydown)
    if (event.target.classList.contains('reading-list-input__new-tag')) return;
    if (event.key === 'Enter' && !event.shiftKey && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      onCancel();
    }
  }

  function handleTextareaKeyDown(event) {
    if (event.key === 'Escape') { onCancel(); return; }
    if (event.key === 'Enter' && event.shiftKey) { event.preventDefault(); handleSave(); }
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
          ${tagsTemplate()}
        </div>
      </div>
      <div class="reading-list-input__controls">
        <button class="button-ok" @click=${handleSave} title="Save">✓</button>
        <button class="button-cancel" @click=${onCancel} title="Cancel">✕</button>
      </div>
    </div>
  `;
}
