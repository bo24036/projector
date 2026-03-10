import * as Task from '../domains/Task.js';
import { registerHandler } from '../state.js';

registerHandler('CREATE_TASK', (state, action) => {
  const { projectId, name, dueDate } = action.payload;

  try {
    Task.createTask(projectId, name, dueDate);
    return { state: { ...state, creatingTask: false } };
  } catch (error) {
    alert(error.message);
    return { state };
  }
});

registerHandler('UPDATE_TASK', (state, action) => {
  const { taskId, name, dueDate, completed } = action.payload;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (completed !== undefined) updates.completed = completed;

  try {
    Task.updateTask(taskId, updates);
    return { state: { ...state, editingTaskId: null, editingTaskName: '', editingTaskDueDate: '' } };
  } catch (error) {
    console.error('Failed to update task:', error.message);
    return { state };
  }
});

registerHandler('DELETE_TASK', (state, action) => {
  const { taskId } = action.payload;

  try {
    Task.deleteTask(taskId);
  } catch (error) {
    console.error('Failed to delete task:', error.message);
  }
  return { state };
});

registerHandler('TOGGLE_TASK_COMPLETED', (state, action) => {
  const { taskId } = action.payload;

  try {
    Task.toggleTaskCompleted(taskId);
  } catch (error) {
    console.error('Failed to toggle task:', error.message);
  }
  return { state };
});

registerHandler('START_CREATE_TASK', (state) => {
  return { state: { ...state, creatingTask: true } };
});

registerHandler('CANCEL_CREATE_TASK', (state) => {
  return { state: { ...state, creatingTask: false } };
});

registerHandler('START_EDIT_TASK', (state, action) => {
  const { taskId } = action.payload;
  const task = Task.getTask(taskId);

  if (!task) {
    console.error(`Task not found: ${taskId}`);
    return { state };
  }

  return {
    state: {
      ...state,
      editingTaskId: taskId,
      editingTaskName: task.name,
      editingTaskDueDate: task.dueDate ? Task.formatDueDate(task.dueDate) : '',
    },
  };
});

registerHandler('CANCEL_EDIT_TASK', (state) => {
  return { state: { ...state, editingTaskId: null, editingTaskName: '', editingTaskDueDate: '' } };
});

registerHandler('TASK_LOADED', (state) => {
  // Task is already in cache from domain's cache-miss fetch.
  // This handler just triggers a re-render via setState.
  return { state };
});
