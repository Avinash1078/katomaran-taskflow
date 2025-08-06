/**
 * Main Todo App Component
 * Orchestrates all features with clean architecture
 * Mobile-first design with smooth animations
 */

import { useState } from 'react';
import { Task } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, User, LogOut, Settings } from 'lucide-react';

export const TodoApp = () => {
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const {
    tasks,
    filters,
    isLoading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateFilters,
    refreshTasks
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Show login screen if not authenticated
  if (!isAuthenticated || authLoading) {
    return <LoginScreen />;
  }

  // Handle task creation
  const handleCreateTask = async (data: any) => {
    const task = await createTask(data);
    if (task) {
      setIsFormOpen(false);
    }
  };

  // Handle task editing
  const handleEditTask = async (data: any) => {
    const task = await updateTask(data);
    if (task) {
      setEditingTask(null);
      setIsFormOpen(false);
    }
  };

  // Handle task form submission
  const handleTaskSubmit = async (data: any) => {
    if (editingTask) {
      await handleEditTask(data);
    } else {
      await handleCreateTask(data);
    }
  };

  // Open edit form
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Open create form
  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Close form
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-sm font-bold">
              ✓
            </div>
            <div>
              <h1 className="text-lg font-bold">Todo Master</h1>
              <p className="text-xs text-muted-foreground">Stay organized</p>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {isFormOpen ? (
          <div className="p-4 animate-task-enter">
            <TaskForm
              task={editingTask}
              onSubmit={handleTaskSubmit}
              onCancel={handleFormCancel}
              isLoading={tasksLoading}
            />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            isLoading={tasksLoading}
            onToggleComplete={toggleTaskCompletion}
            onEdit={handleEditClick}
            onDelete={deleteTask}
            onRefresh={refreshTasks}
            onCreateNew={handleCreateClick}
            filters={filters}
            onFilterChange={updateFilters}
          />
        )}

        {/* Floating Action Button */}
        {!isFormOpen && (
          <button
            onClick={handleCreateClick}
            className="fab animate-bounce-gentle"
            aria-label="Create new task"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </main>
    </div>
  );
};