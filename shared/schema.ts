import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "in-progress", "completed"] }).notNull().default("pending"),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  dueDate: text("due_date"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

const baseEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = baseEmployeeSchema.extend({
  name: z.string({ required_error: "Name is required" }).min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email format"),
  department: z.string({ required_error: "Department is required" }).min(1, "Department is required"),
  position: z.string({ required_error: "Position is required" }).min(1, "Position is required"),
});

const baseTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = baseTaskSchema.extend({
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  status: z.enum(["pending", "in-progress", "completed"], {
    errorMap: () => ({ message: "Status must be 'pending', 'in-progress', or 'completed'" })
  }).optional().default("pending"),
  employeeId: z.number({ required_error: "Employee ID is required", invalid_type_error: "Employee ID must be a number" }).int("Employee ID must be an integer").positive("Employee ID must be positive"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format").optional().nullable(),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priority must be 'low', 'medium', or 'high'" })
  }).optional().default("medium"),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
