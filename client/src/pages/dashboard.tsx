import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Users, UserPlus, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByStatus: { pending: number; "in-progress": number; completed: number };
  tasksByEmployee: {
    employeeId: number;
    employeeName: string;
    taskCount: number;
  }[];
};

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
};

function OverviewBox({
  icon: Icon,
  label,
  value,
  color = "text-accent",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card
      className="bg-card border-border rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
      data-testid={`overview-box-${label}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center gap-3 min-h-20">
          <div className={`p-3 bg-accent/10 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  icon: Icon,
  label,
  onClick,
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Card
      className="bg-card border-border rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <p className="font-semibold text-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const isLoading = statsLoading || employeesLoading;

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!stats || !employees) return null;

  const totalEmployees = employees.length;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Employee Overview & Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <OverviewBox
              icon={Users}
              label="Total Employees"
              value={totalEmployees}
              color="text-blue-600"
            />
            <ActionCard
              icon={UserPlus}
              label="Add Employee"
              onClick={() => navigate("/employees")}
              testId="action-add-employee"
            />
            <ActionCard
              icon={CheckSquare}
              label="Add Task"
              onClick={() => navigate("/tasks")}
              testId="action-add-task"
            />
          </div>
        </div>

        {/* Task Summary */}
        <div>
          <Card className="bg-card border-border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Task Summary</CardTitle>
              <CardDescription>Current task status overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div
                  className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                  onClick={() => navigate("/tasks")}
                  data-testid="task-pending"
                >
                  <p className="text-sm text-muted-foreground mb-2">Pending Tasks</p>
                  <p className="text-3xl font-bold text-foreground">{stats.tasksByStatus.pending}</p>
                </div>
                <div
                  className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
                  onClick={() => navigate("/tasks")}
                  data-testid="task-in-progress"
                >
                  <p className="text-sm text-muted-foreground mb-2">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">{stats.tasksByStatus["in-progress"]}</p>
                </div>
                <div
                  className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                  onClick={() => navigate("/tasks")}
                  data-testid="task-completed"
                >
                  <p className="text-sm text-muted-foreground mb-2">Completed Tasks</p>
                  <p className="text-3xl font-bold text-foreground">{stats.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
