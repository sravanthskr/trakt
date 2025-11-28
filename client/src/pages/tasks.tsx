import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  Loader2,
  Calendar,
  User,
  AlertTriangle,
  X,
  Clock,
  Search,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import type { Employee, Task } from "@shared/schema";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TaskWithEmployee = Task & { employeeName: string; employeeEmail?: string };

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  employeeId: z.string().min(1, "Employee is required"),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithEmployee | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!task;

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      employeeId: "",
      status: "pending",
      priority: "medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        employeeId: task?.employeeId?.toString() || "",
        status: task?.status || "pending",
        priority: task?.priority || "medium",
        dueDate: task?.dueDate || "",
      });
    }
  }, [open, task, form]);

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId, 10),
        description: data.description || null,
        dueDate: data.dueDate || null,
      };
      const response = await apiRequest("POST", "/api/tasks", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Task created successfully" });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId, 10),
        description: data.description || null,
        dueDate: data.dueDate || null,
      };
      const response = await apiRequest("PUT", `/api/tasks/${task!.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task!.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Task updated successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle data-testid="task-dialog-title">
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" data-testid="input-title" {...field} />
                  </FormControl>
                  <FormMessage data-testid="error-title" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description (optional)"
                      className="resize-none"
                      data-testid="input-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="error-description" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-employee">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} - {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage data-testid="error-employee" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-due-date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  task,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithEmployee | null;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-dialog-title">Delete Task</AlertDialogTitle>
          <AlertDialogDescription data-testid="delete-dialog-description">
            Are you sure you want to delete "<strong className="text-foreground">{task?.title}</strong>"?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-delete-confirm"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number | null;
  onEdit: (task: TaskWithEmployee) => void;
  onDelete: (task: TaskWithEmployee) => void;
}) {
  const { data: task, isLoading } = useQuery<TaskWithEmployee>({
    queryKey: ["/api/tasks", taskId],
    enabled: !!taskId && open,
  });

  const taskIsOverdue = task?.dueDate && task.status !== "completed" && isOverdue(task.dueDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle data-testid="detail-dialog-title">Task Details</DialogTitle>
          <DialogDescription>View complete task information.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : task ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={STATUS_COLORS[task.status]} variant="secondary">
                {STATUS_OPTIONS.find((s) => s.value === task.status)?.label}
              </Badge>
              <Badge className={PRIORITY_COLORS[task.priority]} variant="secondary">
                {task.priority} priority
              </Badge>
              {taskIsOverdue && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground" data-testid="text-task-title">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-muted-foreground mt-2" data-testid="text-task-description">
                  {task.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Assigned To</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground" data-testid="text-employee-name">
                    {task.employeeName}
                  </span>
                </div>
                {task.employeeEmail && (
                  <p className="text-muted-foreground text-xs">{task.employeeEmail}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn("text-foreground", taskIsOverdue && "text-destructive")}
                    data-testid="text-due-date"
                  >
                    {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div className="space-y-1">
                <p className="text-muted-foreground">Created</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{formatDate(task.createdAt)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Updated</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close">
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(task);
                }}
                data-testid="button-edit-from-detail"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(task);
                }}
                data-testid="button-delete-from-detail"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <p className="text-muted-foreground">Task not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskFilterPanel({
  statusFilter,
  employeeFilter,
  onStatusChange,
  onEmployeeChange,
  onClear,
  employees,
}: {
  statusFilter: string;
  employeeFilter: string;
  onStatusChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onClear: () => void;
  employees: Employee[];
}) {
  const hasFilters = statusFilter !== "all" || employeeFilter !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border rounded-2xl shadow-sm">
      <div className="flex-1">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger data-testid="filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select value={employeeFilter} onValueChange={onEmployeeChange}>
          <SelectTrigger data-testid="filter-employee">
            <SelectValue placeholder="Filter by employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id.toString()}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="outline" onClick={onClear} data-testid="button-clear-filters">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating,
}: {
  task: TaskWithEmployee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}) {
  const taskIsOverdue = task.dueDate && task.status !== "completed" && isOverdue(task.dueDate);
  const statusLabel = STATUS_OPTIONS.find((s) => s.value === task.status)?.label || task.status;

  return (
    <Card
      className={cn(
        "flex flex-col hover-elevate transition-all cursor-pointer rounded-2xl shadow-sm",
        taskIsOverdue && "border-destructive/50 bg-destructive/5"
      )}
      data-testid={`card-task-${task.id}`}
    >
      {/* Header with status and actions */}
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="flex-1 min-w-0">
          {/* Main title - large and clear */}
          <h3
            className="font-bold text-base text-foreground line-clamp-2 mb-1"
            data-testid={`text-title-${task.id}`}
          >
            {task.title}
          </h3>
          
          {/* Status badge - single, prominent */}
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[task.status]} variant="secondary" data-testid={`badge-status-${task.id}`}>
              {statusLabel}
            </Badge>
            {taskIsOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Quick action buttons - top right */}
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
            data-testid={`button-edit-${task.id}`}
          >
            <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8"
            data-testid={`button-delete-${task.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 py-0">
        {/* Description if exists */}
        {task.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-2 mb-3"
            data-testid={`text-description-${task.id}`}
          >
            {task.description}
          </p>
        )}

        {/* Employee and Due Date - clear layout */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span data-testid={`text-employee-${task.id}`} className="truncate">
              {task.employeeName}
            </span>
          </div>
          
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-2",
                taskIsOverdue ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-due-date-${task.id}`}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Quick status change */}
      <CardFooter className="pt-3 border-t mt-3">
        <Select
          value={task.status}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger
            className="w-full text-sm"
            data-testid={`select-quick-status-${task.id}`}
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <SelectValue placeholder="Change status" />
            )}
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground" data-testid="text-empty-title">
        {hasFilters ? "No Tasks Match Filters" : "No Tasks Found"}
      </h3>
      <p className="text-muted-foreground mt-1" data-testid="text-empty-description">
        {hasFilters
          ? "Try adjusting your filters or clear them to see all tasks."
          : "Get started by creating your first task."}
      </p>
      {hasFilters && (
        <Button variant="outline" className="mt-4" onClick={onClear} data-testid="button-clear-empty">
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export default function Tasks() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithEmployee | null>(null);
  const [viewTaskId, setViewTaskId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery<TaskWithEmployee[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const filteredTasks = allTasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const employeeId = (task as any).employee_id || (task as any).employeeId;
    const matchesEmployee =
      employeeFilter === "all" || (employeeId?.toString() === employeeFilter);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      task.employeeName.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesEmployee && matchesSearch;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Task deleted successfully" });
      setDeleteOpen(false);
      setSelectedTask(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onMutate: async ({ id }) => {
      setUpdatingTaskId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Success", description: "Task status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUpdatingTaskId(null);
    },
  });

  const handleAddNew = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  const handleView = (task: TaskWithEmployee) => {
    setViewTaskId(task.id);
    setDetailOpen(true);
  };

  const handleEdit = (task: TaskWithEmployee) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleDelete = (task: TaskWithEmployee) => {
    setSelectedTask(task);
    setDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
  };

  const handleQuickStatusChange = (taskId: number, status: string) => {
    quickStatusMutation.mutate({ id: taskId, status });
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setEmployeeFilter("all");
    setSearchQuery("");
  };

  const hasFilters = statusFilter !== "all" || employeeFilter !== "all" || searchQuery !== "";

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Tasks
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage and track all assigned tasks.
          </p>
        </div>
        <Button onClick={handleAddNew} className="rounded-xl" data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by title, description, or employee name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl h-11 bg-card border-border"
          data-testid="input-search-tasks"
        />
      </div>

      <TaskFilterPanel
        statusFilter={statusFilter}
        employeeFilter={employeeFilter}
        onStatusChange={setStatusFilter}
        onEmployeeChange={setEmployeeFilter}
        onClear={handleClearFilters}
        employees={employees}
      />

      {tasksLoading ? (
        <LoadingSkeleton />
      ) : filteredTasks.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={handleClearFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => handleView(task)}
              onEdit={() => handleEdit(task)}
              onDelete={() => handleDelete(task)}
              onStatusChange={(status) => handleQuickStatusChange(task.id, status)}
              isUpdating={updatingTaskId === task.id}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        key={selectedTask?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        task={selectedTask}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <TaskDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        taskId={viewTaskId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
