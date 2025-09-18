import { createSelector } from '@ngrx/store';
import { tasksFeature, selectAllTasks } from './tasks.reducer';
import { TaskPriority, TaskStatus } from '@turbovetnx/data';
import { sortTasksByOption } from './task-sort.model';

export const selectTasksLoading = tasksFeature.selectLoading;
export const selectTasksFilter = tasksFeature.selectFilter;
export const selectTasksError = tasksFeature.selectError;
export const selectTasksSort = tasksFeature.selectSort;

export const selectTaskSummary = createSelector(selectAllTasks, (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === TaskStatus.Completed).length;
  const highPriority = tasks.filter((task) => task.priority === TaskPriority.High).length;
  const contributors = new Set<string>();
  tasks.forEach((task) => {
    if (task.createdById) {
      contributors.add(task.createdById);
    }
    if (task.assigneeId) {
      contributors.add(task.assigneeId);
    }
  });
  return {
    total,
    completed,
    highPriority,
    contributors: contributors.size,
  };
});

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectTasksFilter,
  selectTasksSort,
  (tasks, filter, sort) => {
    const search = filter.search?.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      if (filter.category && task.category !== filter.category) {
        return false;
      }
      if (search) {
        const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }
      return true;
    });
    return sortTasksByOption(filtered, sort);
  },
);

export const selectTasksByStatus = createSelector(
  selectFilteredTasks,
  (tasks) =>
    Object.values(TaskStatus).reduce<Record<TaskStatus, typeof tasks>>(
      (accumulator, status) => ({
        ...accumulator,
        [status]: tasks.filter((task) => task.status === status),
      }),
      {
        [TaskStatus.Backlog]: [],
        [TaskStatus.InProgress]: [],
        [TaskStatus.Blocked]: [],
        [TaskStatus.Completed]: [],
      },
    ),
);
