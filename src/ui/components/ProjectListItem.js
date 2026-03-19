import { html } from '/vendor/lit-html/lit-html.js';

export function ProjectListItem({ project, isSelected, openTaskCount, urgency, isHeld, isReviewDue, onSelect }) {
  const classes = [
    'project-list-item',
    isSelected ? 'is-selected' : '',
    isHeld ? 'is-held' : `urgency-${urgency ?? 'gray'}`,
    isHeld && isReviewDue ? 'is-review-due' : '',
  ].filter(Boolean).join(' ');

  return html`
    <div class="${classes}">
      <button class="project-list-item__button" @click=${onSelect}>
        ${project.name}
        ${isHeld
          ? html`<span class="project-list-item__hold-icon ${isReviewDue ? 'project-list-item__hold-icon--review-due' : ''}">⏸</span>`
          : openTaskCount > 0 ? html`<span class="sidebar__count">${openTaskCount}</span>` : ''
        }
      </button>
    </div>
  `;
}
