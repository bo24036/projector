import { html } from 'https://unpkg.com/lit-html@2/lit-html.js';

export function NotesInput({ notes, link, onSave, onCancel }) {
  let notesValue = notes;
  let linkValue = link;

  function handleNotesInput(event) {
    notesValue = event.target.value;
  }

  function handleLinkInput(event) {
    linkValue = event.target.value;
  }

  return html`
    <div class="notes-input">
      <textarea
        class="notes-input__textarea"
        placeholder="Enter project notes..."
        .value=${notesValue}
        @input=${handleNotesInput}
      ></textarea>
      <input
        class="notes-input__link"
        type="url"
        placeholder="Add a link (optional)"
        .value=${linkValue}
        @input=${handleLinkInput}
      />
      <div class="notes-input__controls">
        <button
          class="button-ok"
          @click=${() => onSave(notesValue, linkValue)}
          title="Save"
        >
          ✓
        </button>
        <button class="button-cancel" @click=${onCancel} title="Cancel">
          ✕
        </button>
      </div>
    </div>
  `;
}
