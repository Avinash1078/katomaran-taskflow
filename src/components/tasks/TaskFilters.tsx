/**
 * Task Filters Component
 * Filter controls for task status and sorting
 * Mobile-optimized with smooth animations
 */

import { TaskStatus, TaskFilters as TaskFiltersType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  X,
  SortAsc,
  SortDesc 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
}

export const TaskFilters = ({ filters, onFilterChange }: TaskFiltersProps) => {
  const hasActiveFilters = filters.status || filters.sortBy;

  const handleStatusFilter = (status: TaskStatus | undefined) => {
    onFilterChange({ ...filters, status });
  };

  const handleSortChange = (value: string) => {
    if (value === 'none') {
      const { sortBy, sortOrder, ...rest } = filters;
      onFilterChange(rest);
    } else {
      const [sortBy, sortOrder] = value.split('-') as ['dueDate' | 'createdAt' | 'title', 'asc' | 'desc'];
      onFilterChange({ ...filters, sortBy, sortOrder });
    }
  };

  const clearFilters = () => {
    onFilterChange({ search: filters.search }); // Keep search
  };

  const getSortValue = () => {
    if (!filters.sortBy) return 'none';
    return `${filters.sortBy}-${filters.sortOrder || 'asc'}`;
  };

  return (
    <div className="space-y-3">
      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Filter className="w-4 h-4" />
          <span>Status:</span>
        </div>
        
        <Button
          variant={!filters.status ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter(undefined)}
          className="flex-shrink-0 h-8"
        >
          All Tasks
        </Button>
        
        <Button
          variant={filters.status === TaskStatus.OPEN ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter(TaskStatus.OPEN)}
          className="flex-shrink-0 h-8"
        >
          <Circle className="w-4 h-4 mr-1" />
          Open
        </Button>
        
        <Button
          variant={filters.status === TaskStatus.COMPLETE ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter(TaskStatus.COMPLETE)}
          className="flex-shrink-0 h-8"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Complete
        </Button>
      </div>

      {/* Sort and Clear Filters */}
      <div className="flex items-center gap-2">
        {/* Sort Dropdown */}
        <Select value={getSortValue()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <div className="flex items-center gap-1">
              {filters.sortOrder === 'desc' ? (
                <SortDesc className="w-3 h-3" />
              ) : (
                <SortAsc className="w-3 h-3" />
              )}
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            <SelectItem value="createdAt-desc">Newest first</SelectItem>
            <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            <SelectItem value="dueDate-asc">Due date (soon)</SelectItem>
            <SelectItem value="dueDate-desc">Due date (later)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {filters.status && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              {filters.status === TaskStatus.COMPLETE ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              {filters.status}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => handleStatusFilter(undefined)}
              />
            </Badge>
          )}
          
          {filters.sortBy && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              {filters.sortOrder === 'desc' ? (
                <SortDesc className="w-3 h-3" />
              ) : (
                <SortAsc className="w-3 h-3" />
              )}
              {filters.sortBy}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  const { sortBy, sortOrder, ...rest } = filters;
                  onFilterChange(rest);
                }}
              />
            </Badge>
          )}
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-8 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};