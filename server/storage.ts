import db from "./config/database";
import { runMigrations } from "./database/migrations";
import { seedDatabase } from "./database/seed";
import type { Employee, InsertEmployee, Task, InsertTask } from "@shared/schema";

runMigrations();
seedDatabase();

export interface IStorage {
  getAllEmployees(): Employee[];
  getEmployeeById(id: number): Employee | undefined;
  getEmployeeWithTasks(id: number): (Employee & { tasks: Task[] }) | undefined;
  createEmployee(employee: InsertEmployee): Employee;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Employee | undefined;
  deleteEmployee(id: number): boolean;

  getAllTasks(filters?: { status?: string; employeeId?: number }): (Task & { employeeName: string })[];
  getTaskById(id: number): (Task & { employeeName: string; employeeEmail: string }) | undefined;
  createTask(task: InsertTask): Task;
  updateTask(id: number, task: Partial<InsertTask>): Task | undefined;
  deleteTask(id: number): boolean;

  getDashboardStats(): {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    tasksByStatus: { pending: number; "in-progress": number; completed: number };
    tasksByEmployee: { employeeId: number; employeeName: string; taskCount: number }[];
  };
}

export class SQLiteStorage implements IStorage {
  getAllEmployees(): Employee[] {
    const stmt = db.prepare("SELECT * FROM employees ORDER BY name");
    return stmt.all() as Employee[];
  }

  getEmployeeById(id: number): Employee | undefined {
    const stmt = db.prepare("SELECT * FROM employees WHERE id = ?");
    return stmt.get(id) as Employee | undefined;
  }

  getEmployeeWithTasks(id: number): (Employee & { tasks: Task[] }) | undefined {
    const employee = this.getEmployeeById(id);
    if (!employee) return undefined;

    const tasksStmt = db.prepare("SELECT * FROM tasks WHERE employee_id = ? ORDER BY created_at DESC");
    const tasks = tasksStmt.all(id) as Task[];

    return { ...employee, tasks };
  }

  createEmployee(employee: InsertEmployee): Employee {
    const stmt = db.prepare(`
      INSERT INTO employees (name, email, department, position)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(employee.name, employee.email, employee.department, employee.position);
    return this.getEmployeeById(result.lastInsertRowid as number)!;
  }

  updateEmployee(id: number, employee: Partial<InsertEmployee>): Employee | undefined {
    const existing = this.getEmployeeById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (employee.name !== undefined) { updates.push("name = ?"); values.push(employee.name); }
    if (employee.email !== undefined) { updates.push("email = ?"); values.push(employee.email); }
    if (employee.department !== undefined) { updates.push("department = ?"); values.push(employee.department); }
    if (employee.position !== undefined) { updates.push("position = ?"); values.push(employee.position); }

    if (updates.length === 0) return existing;

    values.push(id);
    const stmt = db.prepare(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?`);
    stmt.run(...values);

    return this.getEmployeeById(id);
  }

  deleteEmployee(id: number): boolean {
    const stmt = db.prepare("DELETE FROM employees WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getAllTasks(filters?: { status?: string; employeeId?: number }): (Task & { employeeName: string })[] {
    let query = `
      SELECT t.*, e.name as employeeName
      FROM tasks t
      JOIN employees e ON t.employee_id = e.id
    `;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.status) {
      conditions.push("t.status = ?");
      params.push(filters.status);
    }
    if (filters?.employeeId) {
      conditions.push("t.employee_id = ?");
      params.push(filters.employeeId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY t.created_at DESC";

    const stmt = db.prepare(query);
    return stmt.all(...params) as (Task & { employeeName: string })[];
  }

  getTaskById(id: number): (Task & { employeeName: string; employeeEmail: string }) | undefined {
    const stmt = db.prepare(`
      SELECT t.*, e.name as employeeName, e.email as employeeEmail
      FROM tasks t
      JOIN employees e ON t.employee_id = e.id
      WHERE t.id = ?
    `);
    return stmt.get(id) as (Task & { employeeName: string; employeeEmail: string }) | undefined;
  }

  createTask(task: InsertTask): Task {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, employee_id, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      task.title,
      task.description || null,
      task.status || "pending",
      task.employeeId,
      task.dueDate || null,
      task.priority || "medium"
    );
    
    const getStmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
    return getStmt.get(result.lastInsertRowid) as Task;
  }

  updateTask(id: number, task: Partial<InsertTask>): Task | undefined {
    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
    if (!existing) return undefined;

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const values: (string | number | null)[] = [];

    if (task.title !== undefined) { updates.push("title = ?"); values.push(task.title); }
    if (task.description !== undefined) { updates.push("description = ?"); values.push(task.description); }
    if (task.status !== undefined) { updates.push("status = ?"); values.push(task.status); }
    if (task.employeeId !== undefined) { updates.push("employee_id = ?"); values.push(task.employeeId); }
    if (task.dueDate !== undefined) { updates.push("due_date = ?"); values.push(task.dueDate); }
    if (task.priority !== undefined) { updates.push("priority = ?"); values.push(task.priority); }

    values.push(id);
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`);
    stmt.run(...values);

    return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task;
  }

  deleteTask(id: number): boolean {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getDashboardStats() {
    const totalTasks = (db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number }).count;
    const completedTasks = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as { count: number }).count;
    const pendingTasks = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as { count: number }).count;
    const inProgressTasks = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'").get() as { count: number }).count;

    const tasksByEmployee = db.prepare(`
      SELECT e.id as employeeId, e.name as employeeName, COUNT(t.id) as taskCount
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      GROUP BY e.id
      ORDER BY taskCount DESC
    `).all() as { employeeId: number; employeeName: string; taskCount: number }[];

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus: {
        pending: pendingTasks,
        "in-progress": inProgressTasks,
        completed: completedTasks,
      },
      tasksByEmployee,
    };
  }
}

export const storage = new SQLiteStorage();
