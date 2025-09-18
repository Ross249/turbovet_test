import { TaskDto, TaskPriority } from '@turbovetnx/data';

export type TaskSortOption = 'recent' | 'oldest' | 'priorityHigh' | 'titleAsc';

export const TASK_SORT_DEFAULT: TaskSortOption = 'recent';

const priorityRank: Record<TaskPriority, number> = {
  [TaskPriority.High]: 0,
  [TaskPriority.Medium]: 1,
  [TaskPriority.Low]: 2,
};

const comparers: Record<TaskSortOption, (a: TaskDto, b: TaskDto) => number> = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  oldest: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
  priorityHigh: (a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return b.updatedAt.localeCompare(a.updatedAt);
  },
  titleAsc: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
};

export function sortTasksByOption(tasks: TaskDto[], sort: TaskSortOption): TaskDto[] {
  const comparer = comparers[sort] ?? comparers.recent;
  return [...tasks].sort(comparer);
}
