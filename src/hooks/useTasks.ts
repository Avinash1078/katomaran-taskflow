/**
 * Tasks Hook
 * React hook for managing task state and operations
 * Includes optimistic updates and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import { taskService } from '@/services/taskService';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  // Load tasks from service
  const loadTasks = useCallback(async (currentFilters: TaskFilters = filters) => {
    try {
      setIsLoading(true);
      setError(undefined);
      
      const loadedTasks = await taskService.getTasks(currentFilters);
      setTasks(loadedTasks);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load tasks';
      setError(errorMessage);
      
      toast({
        title: "Error Loading Tasks",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  // Initialize tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Create new task
  const createTask = useCallback(async (request: CreateTaskRequest): Promise<Task | null> => {
    try {
      setError(undefined);
      
      const newTask = await taskService.createTask(request);
      
      // Optimistic update
      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "Task Created",
        description: `"${newTask.title}" has been added`,
        className: "animate-bounce-gentle",
      });

      return newTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create task';
      setError(errorMessage);
      
      toast({
        title: "Error Creating Task",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [toast]);

  // Update task
  const updateTask = useCallback(async (request: UpdateTaskRequest): Promise<Task | null> => {
    try {
      setError(undefined);
      
      const updatedTask = await taskService.updateTask(request);
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));

      toast({
        title: "Task Updated",
        description: `"${updatedTask.title}" has been updated`,
      });

      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update task';
      setError(errorMessage);
      
      toast({
        title: "Error Updating Task",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [toast]);

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(undefined);
      
      const taskToDelete = tasks.find(task => task.id === id);
      
      // Optimistic update
      setTasks(prev => prev.filter(task => task.id !== id));
      
      await taskService.deleteTask(id);

      toast({
        title: "Task Deleted",
        description: taskToDelete ? `"${taskToDelete.title}" has been deleted` : "Task deleted",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      
      // Revert optimistic update
      await loadTasks();
      
      toast({
        title: "Error Deleting Task",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [tasks, toast, loadTasks]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (id: string): Promise<Task | null> => {
    try {
      setError(undefined);
      
      const updatedTask = await taskService.toggleTaskCompletion(id);
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));

      const status = updatedTask.status === 'complete' ? 'completed' : 'reopened';
      toast({
        title: `Task ${status}`,
        description: `"${updatedTask.title}" has been ${status}`,
        className: updatedTask.status === 'complete' ? "animate-bounce-gentle" : "",
      });

      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle task';
      setError(errorMessage);
      
      toast({
        title: "Error Updating Task",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [toast]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadTasks(updatedFilters);
  }, [filters, loadTasks]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters: TaskFilters = {};
    setFilters(clearedFilters);
    loadTasks(clearedFilters);
  }, [loadTasks]);

  // Refresh tasks (for pull-to-refresh)
  const refreshTasks = useCallback(async () => {
    await loadTasks();
    
    toast({
      title: "Tasks Refreshed",
      description: "Your tasks have been updated",
    });
  }, [loadTasks, toast]);

  // Get task statistics
  const getTaskStats = useCallback(async () => {
    try {
      return await taskService.getTaskStats();
    } catch (err: any) {
      console.error('Error getting task stats:', err);
      return { total: 0, completed: 0, pending: 0, overdue: 0 };
    }
  }, []);

  return {
    tasks,
    filters,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateFilters,
    clearFilters,
    refreshTasks,
    getTaskStats
  };
};