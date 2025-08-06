/**
 * Task Stats Component
 * Displays task statistics and summary
 * Mobile-optimized with animated counters
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

interface TaskStatsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export const TaskStats = () => {
  const { getTaskStats } = useTasks();
  const [stats, setStats] = useState<TaskStatsData>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const taskStats = await getTaskStats();
      setStats(taskStats);
    };
    
    loadStats();
  }, [getTaskStats]);

  const getCompletionPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getProgressColor = () => {
    const percentage = getCompletionPercentage();
    if (percentage >= 80) return 'text-accent';
    if (percentage >= 50) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-4 border-b bg-card/50">
      {/* Main Progress */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total === 0 
              ? 'No tasks yet' 
              : `${getCompletionPercentage()}% complete`
            }
          </p>
        </div>
        
        {stats.total > 0 && (
          <div className={`text-2xl font-bold ${getProgressColor()}`}>
            {stats.completed}/{stats.total}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-accent to-accent h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      )}

      {/* Stats Grid */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {/* Pending Tasks */}
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="flex items-center justify-center mb-1">
              <Circle className="w-4 h-4 text-primary mr-1" />
              <span className="text-lg font-semibold text-primary">
                {stats.pending}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>

          {/* Completed Tasks */}
          <div className="text-center p-2 rounded-lg bg-accent/10">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-accent mr-1" />
              <span className="text-lg font-semibold text-accent">
                {stats.completed}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>

          {/* Overdue Tasks */}
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive mr-1" />
              <span className="text-lg font-semibold text-destructive">
                {stats.overdue}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {stats.total > 0 && (
        <div className="mt-3 text-center">
          {getCompletionPercentage() === 100 ? (
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              <TrendingUp className="w-3 h-3 mr-1" />
              All tasks complete! 🎉
            </Badge>
          ) : stats.overdue > 0 ? (
            <Badge variant="destructive" className="bg-destructive/20 text-destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              <Calendar className="w-3 h-3 mr-1" />
              Keep up the great work!
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};