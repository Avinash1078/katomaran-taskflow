/**
 * Task Service - Business Logic Layer
 * Handles CRUD operations with local storage persistence
 * Following Clean Architecture principles
 */

import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/types/task';

class TaskService {
  private readonly STORAGE_KEY = 'todo_tasks';
  private readonly USER_KEY = 'todo_user_id';

  /**
   * Get all tasks for current user with optional filtering
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      const tasks = this.loadTasksFromStorage();
      let filteredTasks = tasks;

      // Apply filters
      if (filters?.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (filters?.sortBy) {
        filteredTasks.sort((a, b) => {
          const aValue = this.getSortValue(a, filters.sortBy!);
          const bValue = this.getSortValue(b, filters.sortBy!);
          
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      return filteredTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw new Error('Failed to load tasks');
    }
  }

  /**
   * Create a new task
   */
  async createTask(request: CreateTaskRequest): Promise<Task> {
    try {
      const task: Task = {
        id: this.generateId(),
        title: request.title.trim(),
        description: request.description?.trim(),
        dueDate: request.dueDate,
        status: TaskStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: this.getCurrentUserId()
      };

      const tasks = this.loadTasksFromStorage();
      tasks.push(task);
      this.saveTasksToStorage(tasks);

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      const tasks = this.loadTasksFromStorage();
      const taskIndex = tasks.findIndex(task => task.id === request.id);

      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...request,
        updatedAt: new Date()
      };

      tasks[taskIndex] = updatedTask;
      this.saveTasksToStorage(tasks);

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const tasks = this.loadTasksFromStorage();
      const filteredTasks = tasks.filter(task => task.id !== id);
      
      if (filteredTasks.length === tasks.length) {
        throw new Error('Task not found');
      }

      this.saveTasksToStorage(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<Task> {
    try {
      const tasks = this.loadTasksFromStorage();
      const task = tasks.find(task => task.id === id);

      if (!task) {
        throw new Error('Task not found');
      }

      const newStatus = task.status === TaskStatus.OPEN ? TaskStatus.COMPLETE : TaskStatus.OPEN;
      return this.updateTask({ id, status: newStatus });
    } catch (error) {
      console.error('Error toggling task:', error);
      throw new Error('Failed to toggle task');
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{ total: number; completed: number; pending: number; overdue: number }> {
    const tasks = await this.getTasks();
    const now = new Date();

    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETE).length,
      pending: tasks.filter(task => task.status === TaskStatus.OPEN).length,
      overdue: tasks.filter(task => 
        task.status === TaskStatus.OPEN && 
        task.dueDate && 
        new Date(task.dueDate) < now
      ).length
    };
  }

  // Private helper methods
  private loadTasksFromStorage(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Error loading from storage:', error);
      return [];
    }
  }

  private saveTasksToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw new Error('Failed to save tasks');
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    return localStorage.getItem(this.USER_KEY) || 'anonymous';
  }

  private getSortValue(task: Task, sortBy: string): any {
    switch (sortBy) {
      case 'dueDate':
        return task.dueDate || new Date('9999-12-31');
      case 'createdAt':
        return task.createdAt;
      case 'title':
        return task.title.toLowerCase();
      default:
        return task.createdAt;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();