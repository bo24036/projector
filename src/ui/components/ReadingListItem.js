import { html } from '/vendor/lit-html/lit-html.js';
import { makeDeleteHandler } from '../../utils/inputHandlers.js';
import { parseLinkField } from '../../domains/ReadingList.js';
import { ReadingListInput } from './ReadingListInput.js';

export function ReadingListItem({
  item,
  isEditing,
  recommenderOptions,
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
      initial: {
        content: item.content,
        link: item.link,
        recommendedBy: item.recommendedBy,
      },
    });
  }

  const parsedLink = parseLinkField(item.link);

  const handleDelete = makeDeleteHandler({
    entityName: item.content.length > 60 ? item.content.slice(0, 60) + '…' : item.content,
    onDelete,
  });

  return html`
    <div class="reading-list-item ${item.read ? 'reading-list-item--read' : ''}">
      <input
        type="checkbox"
        class="reading-list-item__checkbox"
        ?checked=${item.read}
        @change=${onToggleRead}
        title="${item.read ? 'Mark unread' : 'Mark read'}"
      />
      <div class="reading-list-item__content">
        <span class="reading-list-item__text">${item.content}</span>
        ${parsedLink ? html`
          <a
            class="reading-list-item__link"
            href=${parsedLink.url}
            target="_blank"
            rel="noopener noreferrer"
          >${parsedLink.label ?? parsedLink.url}</a>
        ` : ''}
        <div class="reading-list-item__meta">
          ${item.recommendedBy ? html`
            <span class="reading-list-item__recommender">via ${item.recommendedBy}</span>
          ` : ''}
        </div>
      </div>
      <div class="reading-list-item__actions">
        <button class="reading-list-item__edit-btn" @click=${onEdit} title="Edit">✎</button>
        <button class="reading-list-item__delete-btn" @click=${handleDelete} title="Delete">×</button>
      </div>
    </div>
  `;
}
