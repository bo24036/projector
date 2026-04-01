import { html } from '/vendor/lit-html/lit-html.js';
import { makeDatalistId } from '../../utils/domUtils.js';

// Dumb component for creating or editing a reading list item.
// onSave(content, link, recommendedBy, tags) — tags is an array
// onCancel() — cancel and dismiss
export function ReadingListInput({ onSave, onCancel, recommenderOptions = [], tagOptions = [], initial = {} }) {
  let contentValue = initial.content ?? '';
  let linkValue = initial.link ?? '';
  let recommendedByValue = initial.recommendedBy ?? '';
  let tagsValue = initial.tags ? initial.tags.join(', ') : '';

  const recommenderListId = makeDatalistId('rl-recommender-list');
  const tagListId = makeDatalistId('rl-tag-list');

  function parseTags(raw) {
    return raw.split(',').map(t => t.trim()).filter(Boolean);
  }

  function handleSave() {
    if (!contentValue.trim()) return;
    onSave(contentValue.trim(), linkValue.trim(), recommendedByValue.trim(), parseTags(tagsValue));
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSave();
    } else if (event.key === 'Escape') {
      onCancel();
    }
  }

  return html`
    <div class="reading-list-item reading-list-item--editing">
      <div class="reading-list-input__fields">
        <textarea
          ?autofocus=${true}
          data-autofocus
          class="reading-list-input__field reading-list-input__field--content"
          placeholder="Content (required)..."
          .value=${contentValue}
          @input=${e => { contentValue = e.target.value; }}
          @keydown=${handleKeyDown}
          rows="2"
        ></textarea>
        <input
          class="reading-list-input__field reading-list-input__field--link"
          type="text"
          placeholder="Link or [label](url)..."
          .value=${linkValue}
          @input=${e => { linkValue = e.target.value; }}
          @keydown=${handleKeyDown}
        />
        <input
          class="reading-list-input__field reading-list-input__field--recommended-by"
          type="text"
          placeholder="Recommended by..."
          .value=${recommendedByValue}
          list=${recommenderListId}
          @input=${e => { recommendedByValue = e.target.value; }}
          @keydown=${handleKeyDown}
        />
        <datalist id=${recommenderListId}>
          ${recommenderOptions.map(name => html`<option value=${name}></option>`)}
        </datalist>
        <input
          class="reading-list-input__field reading-list-input__field--tags"
          type="text"
          placeholder="Tags (comma-separated)..."
          .value=${tagsValue}
          list=${tagListId}
          @input=${e => { tagsValue = e.target.value; }}
          @keydown=${handleKeyDown}
        />
        <datalist id=${tagListId}>
          ${tagOptions.map(tag => html`<option value=${tag}></option>`)}
        </datalist>
      </div>
      <div class="reading-list-input__controls">
        <button class="button-ok" @click=${handleSave} title="Save">✓</button>
        <button class="button-cancel" @click=${onCancel} title="Cancel">✕</button>
      </div>
    </div>
  `;
}
