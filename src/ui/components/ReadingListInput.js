import { html } from '/vendor/lit-html/lit-html.js';
import { makeDatalistId } from '../../utils/domUtils.js';

export function ReadingListInput({ onSave, onCancel, recommenderOptions = [], initial = {} }) {
  let contentValue = initial.content ?? '';
  let linkValue = initial.link ?? '';
  let recommendedByValue = initial.recommendedBy ?? '';

  const recommenderListId = makeDatalistId('rl-recommender-list');

  function handleSave() {
    if (!contentValue.trim()) return;
    onSave(contentValue.trim(), linkValue.trim(), recommendedByValue.trim());
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') { onCancel(); return; }
    if (event.key === 'Enter' && !event.shiftKey && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      handleSave();
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
      </div>
      <div class="reading-list-input__controls">
        <button class="button-ok" @click=${handleSave} title="Save">✓</button>
        <button class="button-cancel" @click=${onCancel} title="Cancel">✕</button>
      </div>
    </div>
  `;
}
