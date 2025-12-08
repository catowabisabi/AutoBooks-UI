"use client";

/**
 * Task Progress Components
 * ========================
 * UI components for displaying and managing async task progress.
 */

import * as React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { X, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  type AsyncTask,
  type TaskStatus,
  getTask,
  getTaskProgress,
  cancelTask,
  getTaskStatusColor,
  getProgressBarColor,
  formatDuration,
  getTaskTypeDisplayName,
} from "@/features/ai/services/task-service";

// ============================================================================
// Task Progress Bar
// ============================================================================

interface TaskProgressBarProps {
  progress: number;
  status: TaskStatus;
  message?: string;
  className?: string;
  showPercentage?: boolean;
}

export function TaskProgressBar({
  progress,
  status,
  message,
  className,
  showPercentage = true,
}: TaskProgressBarProps) {
  const progressColor = getProgressBarColor(status);
  const isIndeterminate = status === "PENDING" || (status === "STARTED" && progress === 0);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        {message && (
          <span className="text-muted-foreground truncate max-w-[70%]">{message}</span>
        )}
        {showPercentage && !isIndeterminate && (
          <span className="text-muted-foreground font-medium">{progress}%</span>
        )}
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
        {isIndeterminate ? (
          <div
            className={cn(
              "absolute h-full w-1/3 rounded-full animate-progress-indeterminate",
              progressColor
            )}
          />
        ) : (
          <div
            className={cn("h-full rounded-full transition-all duration-500", progressColor)}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Task Status Icon
// ============================================================================

interface TaskStatusIconProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusIcon({ status, className }: TaskStatusIconProps) {
  const icons: Record<TaskStatus, React.ReactNode> = {
    PENDING: <Clock className={cn("h-4 w-4 text-gray-500", className)} />,
    STARTED: <Loader2 className={cn("h-4 w-4 text-blue-500 animate-spin", className)} />,
    PROGRESS: <Loader2 className={cn("h-4 w-4 text-blue-500 animate-spin", className)} />,
    SUCCESS: <CheckCircle2 className={cn("h-4 w-4 text-green-500", className)} />,
    FAILURE: <XCircle className={cn("h-4 w-4 text-red-500", className)} />,
    REVOKED: <Ban className={cn("h-4 w-4 text-yellow-500", className)} />,
  };

  return <>{icons[status] || icons.PENDING}</>;
}

// ============================================================================
// Task Card
// ============================================================================

interface TaskCardProps {
  task: AsyncTask;
  onCancel?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function TaskCard({ task, onCancel, onRetry, showDetails = true }: TaskCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TaskStatusIcon status={task.status} className="h-5 w-5" />
            <div>
              <CardTitle className="text-base">{task.name}</CardTitle>
              <CardDescription className="text-xs">
                {getTaskTypeDisplayName(task.task_type)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTaskStatusColor(task.status)}>
              {task.status}
            </Badge>
            {task.is_running && onCancel && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel task</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskProgressBar
          progress={task.progress}
          status={task.status}
          message={task.progress_message}
        />

        {showDetails && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {task.started_at && `Started: ${new Date(task.started_at).toLocaleTimeString()}`}
            </span>
            {task.duration_seconds > 0 && (
              <span>Duration: {formatDuration(task.duration_seconds)}</span>
            )}
          </div>
        )}

        {task.status === "FAILURE" && task.error_message && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{task.error_message}</span>
          </div>
        )}

        {task.status === "SUCCESS" && task.result && showDetails && (
          <div className="p-2 rounded-md bg-green-50 text-green-700 text-sm">
            <p className="font-medium">Task completed successfully</p>
            {task.result.download_url && (
              <a
                href={task.result.download_url as string}
                className="text-green-600 underline hover:no-underline"
              >
                Download result
              </a>
            )}
          </div>
        )}

        {task.status === "FAILURE" && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Task Progress Tracker (with polling)
// ============================================================================

interface TaskProgressTrackerProps {
  taskId: string;
  useCeleryId?: boolean;
  pollInterval?: number;
  onComplete?: (task: AsyncTask) => void;
  onError?: (error: Error) => void;
  showCancel?: boolean;
  compact?: boolean;
}

export function TaskProgressTracker({
  taskId,
  useCeleryId = false,
  pollInterval = 2000,
  onComplete,
  onError,
  showCancel = true,
  compact = false,
}: TaskProgressTrackerProps) {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = React.useState(true);

  const { data: task, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => (useCeleryId ? getTaskProgress(taskId) : getTask(taskId)),
    refetchInterval: isPolling ? pollInterval : false,
    retry: 2,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(task?.id || taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  React.useEffect(() => {
    if (task?.is_complete) {
      setIsPolling(false);
      if (task.status === "SUCCESS") {
        onComplete?.(task);
      }
    }
  }, [task, onComplete]);

  React.useEffect(() => {
    if (error) {
      onError?.(error as Error);
    }
  }, [error, onError]);

  if (!task) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading task status...
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <TaskStatusIcon status={task.status} />
        <div className="flex-1 min-w-0">
          <TaskProgressBar
            progress={task.progress}
            status={task.status}
            message={task.progress_message}
          />
        </div>
        {task.is_running && showCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <TaskCard
      task={task}
      onCancel={showCancel ? () => cancelMutation.mutate() : undefined}
      showDetails={true}
    />
  );
}

// ============================================================================
// Running Tasks Panel (shows all running tasks)
// ============================================================================

interface RunningTasksPanelProps {
  maxTasks?: number;
  className?: string;
}

export function RunningTasksPanel({ maxTasks = 5, className }: RunningTasksPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "running"],
    queryFn: () =>
      import("@/features/ai/services/task-service").then((m) =>
        m.getTasks({ running: true, page_size: maxTasks })
      ),
    refetchInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.results.length) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Running Tasks</h4>
        <Badge variant="secondary">{data.count}</Badge>
      </div>
      <div className="space-y-2">
        {data.results.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 rounded-md border bg-card"
          >
            <TaskStatusIcon status={task.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.name}</p>
              <TaskProgressBar
                progress={task.progress}
                status={task.status}
                message={task.progress_message}
                showPercentage={false}
              />
            </div>
            <span className="text-xs text-muted-foreground">{task.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Task Notification Toast (for completed tasks)
// ============================================================================

interface TaskToastProps {
  task: AsyncTask;
  onDismiss?: () => void;
  onViewDetails?: () => void;
}

export function TaskToast({ task, onDismiss, onViewDetails }: TaskToastProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card border rounded-lg shadow-lg max-w-sm">
      <TaskStatusIcon status={task.status} className="h-5 w-5 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{task.name}</p>
        <p className="text-xs text-muted-foreground">
          {task.status === "SUCCESS" && "Completed successfully"}
          {task.status === "FAILURE" && "Failed - click to view details"}
          {task.status === "REVOKED" && "Task was cancelled"}
        </p>
        {task.status === "SUCCESS" && task.result?.download_url && (
          <a
            href={task.result.download_url as string}
            className="text-xs text-primary underline hover:no-underline"
          >
            Download
          </a>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {onViewDetails && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onViewDetails}>
            View
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// CSS for indeterminate progress animation
// Add this to your globals.css:
// @keyframes progress-indeterminate {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(400%); }
// }
// .animate-progress-indeterminate {
//   animation: progress-indeterminate 1.5s ease-in-out infinite;
// }
