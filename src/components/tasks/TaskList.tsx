/**
 * Task List Component
 * Displays tasks with filtering, search, and animations
 * Includes pull-to-refresh and no-data states
 */

import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskStats } from './TaskStats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Plus, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  filters: any;
  onFilterChange: (filters: any) => void;
}

export const TaskList = ({
  tasks,
  isLoading,
  onToggleComplete,
  onEdit,
  onDelete,
  onRefresh,
  onCreateNew,
  filters,
  onFilterChange
}: TaskListProps) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onFilterChange({ ...filters, search: value || undefined });
  }, [filters, onFilterChange]);

  // Pull-to-refresh functionality
  const handlePullStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handlePullMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    
    const touch = e.touches[0];
    const pullDistance = Math.max(0, touch.clientY - 100); // Adjust for header
    setPullOffset(Math.min(pullDistance * 0.5, 80));
  };

  const handlePullEnd = async () => {
    if (pullOffset > 50) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullOffset(0);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const showEmptyState = !isLoading && tasks.length === 0;
  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        {/* Task Stats */}
        <TaskStats />
        
        {/* Search and Filters */}
        <div className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Filter Controls */}
          <TaskFilters 
            filters={filters}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {isPulling && pullOffset > 0 && (
        <div 
          className="flex justify-center items-center py-4 text-primary"
          style={{ transform: `translateY(${pullOffset}px)` }}
        >
          <RefreshCw className={cn(
            "w-5 h-5 transition-transform",
            pullOffset > 50 && "animate-spin"
          )} />
          <span className="ml-2 text-sm">
            {pullOffset > 50 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto"
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={handlePullEnd}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        )}

        {/* Task List */}
        {!isLoading && tasks.length > 0 && (
          <div className="p-4 space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-task-enter"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <TaskCard
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}

            {/* Bottom Spacing for FAB */}
            <div className="h-20" />
          </div>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              
              {hasActiveFilters ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    No tasks match your current filters. Try adjusting your search or filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => onFilterChange({})}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any tasks yet. Create your first task to get started.
                  </p>
                  <Button onClick={onCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Refresh Button (for debugging) */}
      {!isLoading && tasks.length > 0 && (
        <div className="p-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={cn(
              "w-4 h-4 mr-2",
              isRefreshing && "animate-spin"
            )} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Tasks'}
          </Button>
        </div>
      )}
    </div>
  );
};