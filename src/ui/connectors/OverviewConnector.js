import { html, render } from 'https://unpkg.com/lit-html@2/lit-html.js';
import { OverviewPage } from '../components/OverviewPage.js';
import * as Project from '../../domains/Project.js';
import * as Task from '../../domains/Task.js';
import { formatDueDate, getUrgency } from '../../domains/Task.js';
import { dispatch } from '../../state.js';
import { navigateToProject } from '../../utils/router.js';

export function initOverviewConnector(containerSelector, state) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Get all non-archived projects
  const projects = Project.getAllProjects().filter(p => !p.archived);

  // For each project, get incomplete tasks and pre-format dates
  const projectsWithTasks = projects.map(project => {
    const allTasks = Task.getTasksByProjectId(project.id) || [];
    const incompleteTasks = allTasks
      .filter(task => !task.completed)
      .map(task => ({
        task,
        dueDateFormatted: formatDueDate(task.dueDate),
        urgency: getUrgency(task.dueDate),
        onToggle: () => {
          dispatch({ type: 'TOGGLE_TASK_COMPLETED', payload: { taskId: task.id } });
        },
      }));

    return {
      project,
      incompleteTasks,
      onProjectClick: () => {
        navigateToProject(project.id);
      },
    };
  });

  const template = html`${OverviewPage({ projects: projectsWithTasks })}`;

  render(template, container);
}
