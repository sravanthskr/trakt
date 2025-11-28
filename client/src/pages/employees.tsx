import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Eye, Pencil, Trash2, Users, Loader2, Mail, Building2, Briefcase } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import type { Employee, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";

const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

type EmployeeWithTasks = Employee & { tasks: Task[] };

function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      position: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: employee?.name || "",
        email: employee?.email || "",
        department: employee?.department || "",
        position: employee?.position || "",
      });
    }
  }, [open, employee, form]);

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Employee created successfully" });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("PUT", `/api/employees/${employee!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employee!.id] });
      toast({ title: "Success", description: "Employee updated successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the employee information below."
              : "Fill in the details to add a new employee."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      data-testid="input-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="error-name" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      data-testid="input-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="error-email" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Engineering"
                      data-testid="input-department"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="error-department" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Software Engineer"
                      data-testid="input-position"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="error-position" />
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
  employee,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-dialog-title">Delete Employee</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2" data-testid="delete-dialog-description">
            <span className="block">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{employee?.name}</strong>?
            </span>
            <span className="block text-destructive">
              This action cannot be undone. All tasks assigned to this employee will also be deleted.
            </span>
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

function EmployeeDetailView({
  open,
  onOpenChange,
  employeeId,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  const { data: employee, isLoading } = useQuery<EmployeeWithTasks>({
    queryKey: ["/api/employees", employeeId],
    enabled: !!employeeId && open,
  });

  const pendingTasks = employee?.tasks.filter((t) => t.status === "pending") || [];
  const inProgressTasks = employee?.tasks.filter((t) => t.status === "in-progress") || [];
  const completedTasks = employee?.tasks.filter((t) => t.status === "completed") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="detail-dialog-title">Employee Details</DialogTitle>
          <DialogDescription>View employee information and assigned tasks.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : employee ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold text-foreground" data-testid="text-employee-name">
                      {employee.name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span data-testid="text-employee-email">{employee.email}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span data-testid="text-employee-department">{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span data-testid="text-employee-position">{employee.position}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Assigned Tasks ({employee.tasks.length})
              </h4>

              {employee.tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm" data-testid="text-no-tasks">
                  No tasks assigned to this employee.
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">
                        Pending ({pendingTasks.length})
                      </h5>
                      <div className="space-y-2">
                        {pendingTasks.map((task) => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                  {inProgressTasks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">
                        In Progress ({inProgressTasks.length})
                      </h5>
                      <div className="space-y-2">
                        {inProgressTasks.map((task) => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">
                        Completed ({completedTasks.length})
                      </h5>
                      <div className="space-y-2">
                        {completedTasks.map((task) => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close">
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(employee);
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
                  onDelete(employee);
                }}
                data-testid="button-delete-from-detail"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <p className="text-muted-foreground">Employee not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div
      className="flex items-center justify-between p-3 border rounded-md bg-card"
      data-testid={`task-item-${task.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{task.title}</p>
        {task.dueDate && (
          <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Badge className={PRIORITY_COLORS[task.priority]} variant="secondary">
          {task.priority}
        </Badge>
        <Badge className={STATUS_COLORS[task.status]} variant="secondary">
          {task.status}
        </Badge>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground" data-testid="text-empty-title">
        No Employees Found
      </h3>
      <p className="text-muted-foreground mt-1" data-testid="text-empty-description">
        Get started by adding your first employee.
      </p>
    </div>
  );
}

function EmployeeTable({
  employees,
  onView,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead className="hidden lg:table-cell">Department</TableHead>
          <TableHead className="hidden xl:table-cell">Position</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground" data-testid={`text-name-${employee.id}`}>
                    {employee.name}
                  </p>
                  <p className="text-sm text-muted-foreground md:hidden">
                    {employee.email}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell" data-testid={`text-email-${employee.id}`}>
              {employee.email}
            </TableCell>
            <TableCell className="hidden lg:table-cell" data-testid={`text-department-${employee.id}`}>
              <Badge variant="secondary">{employee.department}</Badge>
            </TableCell>
            <TableCell className="hidden xl:table-cell" data-testid={`text-position-${employee.id}`}>
              {employee.position}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(employee)}
                  data-testid={`button-view-${employee.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(employee)}
                  data-testid={`button-edit-${employee.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(employee)}
                  data-testid={`button-delete-${employee.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MobileEmployeeCards({
  employees,
  onView,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  return (
    <div className="space-y-3 sm:hidden">
      {employees.map((employee) => (
        <Card key={employee.id} data-testid={`card-employee-${employee.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{employee.department}</Badge>
              <Badge variant="outline">{employee.position}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-1 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(employee)}
                data-testid={`button-view-mobile-${employee.id}`}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(employee)}
                data-testid={`button-edit-mobile-${employee.id}`}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(employee)}
                className="text-destructive"
                data-testid={`button-delete-mobile-${employee.id}`}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Employees() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewEmployeeId, setViewEmployeeId] = useState<number | null>(null);

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Success", description: "Employee deleted successfully" });
      setDeleteOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const handleView = (employee: Employee) => {
    setViewEmployeeId(employee.id);
    setDetailOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      deleteMutation.mutate(selectedEmployee.id);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Team Members
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage your team members and their information.
          </p>
        </div>
        <Button onClick={handleAddNew} className="rounded-xl" data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSkeleton />
          ) : employees.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="hidden sm:block">
                <EmployeeTable
                  employees={employees}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              <div className="p-4 sm:hidden">
                <MobileEmployeeCards
                  employees={employees}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        key={selectedEmployee?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        employee={selectedEmployee}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <EmployeeDetailView
        open={detailOpen}
        onOpenChange={setDetailOpen}
        employeeId={viewEmployeeId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
