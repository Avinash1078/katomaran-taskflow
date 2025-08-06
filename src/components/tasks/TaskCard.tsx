/**
 * Task Card Component
 * Individual task display with swipe gestures and animations
 * Mobile-optimized with smooth interactions
 */

import { useState, useRef } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  Circle,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const TaskCard = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  className 
}: TaskCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);

  // Handle touch/mouse events for swipe
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    currentX.current = clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow left swipe (negative diff)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -100));
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    // If swiped far enough, trigger delete
    if (swipeOffset < -60) {
      onDelete(task.id);
    } else {
      // Snap back
      setSwipeOffset(0);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Helper functions
  const isOverdue = () => {
    return task.status === TaskStatus.OPEN && 
           task.dueDate && 
           new Date(task.dueDate) < new Date();
  };

  const getDueLabel = () => {
    if (!task.dueDate) return null;
    
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getStatusColor = () => {
    if (task.status === TaskStatus.COMPLETE) return 'task-complete';
    if (isOverdue()) return 'task-overdue';
    return 'task-pending';
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Delete Background */}
      {swipeOffset < 0 && (
        <div 
          className="swipe-action"
          style={{ width: Math.abs(swipeOffset) }}
        >
          <Trash2 className="w-5 h-5 mr-4" />
        </div>
      )}

      {/* Main Task Card */}
      <Card
        ref={cardRef}
        className={cn(
          "task-card relative select-none cursor-grab active:cursor-grabbing transition-transform duration-200",
          task.status === TaskStatus.COMPLETE && "opacity-75",
          className
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Completion Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 rounded-full hover:bg-transparent"
              onClick={() => onToggleComplete(task.id)}
            >
              {task.status === TaskStatus.COMPLETE ? (
                <CheckCircle2 className="w-6 h-6 text-accent" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </Button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-sm leading-5 mb-1",
                task.status === TaskStatus.COMPLETE && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "text-xs text-muted-foreground mb-2 line-clamp-2",
                  task.status === TaskStatus.COMPLETE && "line-through"
                )}>
                  {task.description}
                </p>
              )}

              {/* Task Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getStatusColor())}
                >
                  {task.status === TaskStatus.COMPLETE ? 'Complete' : 'Open'}
                </Badge>

                {/* Due Date */}
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue() ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {isOverdue() ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>{getDueLabel()}</span>
                  </div>
                )}

                {/* Created Time */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onToggleComplete(task.id)}
                  className="text-accent"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {task.status === TaskStatus.COMPLETE ? 'Mark Incomplete' : 'Mark Complete'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};