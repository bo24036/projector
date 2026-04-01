import { html } from '/vendor/lit-html/lit-html.js';
import { makeDeleteHandler } from '../../utils/inputHandlers.js';
import { ReadingListInput } from './ReadingListInput.js';

// Dumb component for a single reading list item.
// Display mode: clickable title, notes, tags, recommender, read toggle, edit/delete.
// Edit mode: inline ReadingListInput prefilled with current values.
export function ReadingListItem({
  item,
  isEditing,
  recommenderOptions,
  tagOptions,
  onToggleRead,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  if (isEditing) {
    return ReadingListInput({
      onSave,
      onCancel,
      recommenderOptions,
      tagOptions,
      initial: {
        url: item.url,
        title: item.title,
        notes: item.notes,
        recommendedBy: item.recommendedBy,
        tags: item.tags,
      },
    });
  }

  const handleDelete = makeDeleteHandler({
    entityName: item.title,
    onDelete,
  });

  return html`
    <div class="reading-list-item ${item.read ? 'reading-list-item--read' : ''}">
      <div class="reading-list-item__content">
        <a
          class="reading-list-item__title"
          href=${item.url}
          target="_blank"
          rel="noopener noreferrer"
        >${item.title}</a>
        ${item.notes ? html`<p class="reading-list-item__notes">${item.notes}</p>` : ''}
        <div class="reading-list-item__meta">
          ${item.tags.length > 0 ? html`
            <span class="reading-list-item__tags">
              ${item.tags.map(tag => html`<span class="reading-list-item__tag">${tag}</span>`)}
            </span>
          ` : ''}
          ${item.recommendedBy ? html`
            <span class="reading-list-item__recommender">via ${item.recommendedBy}</span>
          ` : ''}
        </div>
      </div>
      <div class="reading-list-item__actions">
        <button
          class="reading-list-item__read-btn ${item.read ? 'is-read' : ''}"
          @click=${onToggleRead}
          title=${item.read ? 'Mark unread' : 'Mark read'}
        >${item.read ? '↩' : '✓'}</button>
        <button class="reading-list-item__edit-btn" @click=${onEdit} title="Edit">✎</button>
        <button class="reading-list-item__delete-btn" @click=${handleDelete} title="Delete">✕</button>
      </div>
    </div>
  `;
}
