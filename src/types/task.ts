/**
 * Task Data Types for Todo App
 * Clean TypeScript interfaces following domain-driven design
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // For multi-user support
}

export enum TaskStatus {
  OPEN = 'open',
  COMPLETE = 'complete'
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  search?: string;
  sortBy?: 'dueDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// UI State Types
export interface TaskListState {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
  error?: string;
}

export interface SwipeState {
  taskId: string | null;
  direction: 'left' | 'right' | null;
  offset: number;
}