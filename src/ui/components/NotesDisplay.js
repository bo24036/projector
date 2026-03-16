import { html } from 'https://unpkg.com/lit-html@2/lit-html.js';

export function NotesDisplay({ notes, link, onEdit, isArchived }) {
  return html`
    <div class="notes-display">
      <div class="notes-display__content">
        <div class="notes-display__text">
          ${notes ? html`<p>${notes}</p>` : html`<p class="notes-display__placeholder">No notes</p>`}
        </div>
        ${link
          ? html`
              <a class="notes-display__link" href=${link} target="_blank" rel="noopener noreferrer">
                ${link}
              </a>
            `
          : ''
        }
      </div>
      ${!isArchived
        ? html`
            <button class="notes-display__edit" @click=${onEdit} title="Edit">
              ✎
            </button>
          `
        : ''
      }
    </div>
  `;
}
