import { html } from '/vendor/lit-html/lit-html.js';

export function ProjectDetail({ project, onNameChange, onDescriptionChange, onArchive, onUnarchive, onToggleFunded, onDelete, onHold, onRestore, isReviewDue, createdAtFormatted, archivedAtFormatted }) {
  if (!project) return html``;

  const isArchived = project.archived;
  const isHeld = project.heldAt !== null;

  function handleNameChange(event) {
    onNameChange(event.target.value);
  }

  function handleDescriptionChange(event) {
    onDescriptionChange(event.target.value);
  }

  function handleArchive() {
    onArchive();
  }

  function handleUnarchive() {
    onUnarchive();
  }

  function handleToggleFunded() {
    onToggleFunded();
  }

  function handleDelete() {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete();
    }
  }

  return html`
    <div class="project-detail">
      <div class="project-detail__header">
        <div class="project-detail__name-wrapper">
          <input
            class="project-detail__name"
            type="text"
            aria-label="Project name"
            value=${project.name}
            ?disabled=${isArchived}
            @change=${handleNameChange}
          />
          <input
            class="project-detail__funded-checkbox"
            type="checkbox"
            aria-label="Mark project as funded"
            .checked=${project.funded}
            ?disabled=${isArchived}
            @change=${handleToggleFunded}
          />
          <span class="project-detail__funded-label" aria-hidden="true">$</span>
          ${!isArchived ? html`
            <button
              class="project-detail__hold-button ${isHeld ? (isReviewDue ? 'project-detail__hold-button--review-due' : 'project-detail__hold-button--active') : ''}"
              aria-label=${isHeld ? 'Restore project' : 'Put project on hold'}
              @click=${isHeld ? onRestore : onHold}
            >${isHeld ? '▶' : '⏸'}</button>
          ` : ''}
        </div>
        <div class="project-detail__description-inline">
          <label class="project-detail__label">Description</label>
          <textarea
            class="project-detail__description"
            placeholder="Enter project description..."
            ?disabled=${isArchived}
            @change=${handleDescriptionChange}
            .value=${project.description}
          ></textarea>
        </div>
        <div class="project-detail__button-group">
          ${isArchived
            ? html`
              <button class="project-detail__unarchive-button" @click=${handleUnarchive}>
                Unarchive
              </button>
            `
            : html`
              <button class="project-detail__archive-button" @click=${handleArchive}>
                Archive
              </button>
            `
          }
          <button class="project-detail__delete-button" @click=${handleDelete}>
            Delete
          </button>
        </div>
        <div class="project-detail__metadata-item project-detail__metadata-item--created">
          <span class="project-detail__metadata-label">Created:</span>
          <span class="project-detail__metadata-value">${createdAtFormatted}</span>
        </div>
        ${project.archivedAt
          ? html`
            <div class="project-detail__metadata-item project-detail__metadata-item--archived">
              <span class="project-detail__metadata-label">Archived:</span>
              <span class="project-detail__metadata-value">${archivedAtFormatted}</span>
            </div>
          `
          : ''
        }
      </div>
    </div>
  `;
}

