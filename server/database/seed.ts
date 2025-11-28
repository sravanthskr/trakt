import db from "../config/database";

export function seedDatabase() {
  const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
  
  if (employeeCount.count > 0) {
    console.log("⏭️ Database already has data, skipping seed");
    return;
  }

  const insertEmployee = db.prepare(`
    INSERT INTO employees (name, email, department, position) VALUES (?, ?, ?, ?)
  `);

  const employees = [
    ["Raj Patel", "raj.patel@company.com", "Engineering", "Senior Developer"],
    ["Priya Sharma", "priya.sharma@company.com", "Marketing", "Content Manager"],
    ["Arjun Singh", "arjun.singh@company.com", "Sales", "Sales Representative"],
    ["Divya Gupta", "divya.gupta@company.com", "HR", "HR Manager"],
    ["Aditya Kumar", "aditya.kumar@company.com", "Engineering", "Frontend Developer"],
    ["Neha Malhotra", "neha.malhotra@company.com", "Design", "UI/UX Designer"],
    ["Rohan Verma", "rohan.verma@company.com", "Product", "Product Manager"],
    ["Anjali Nair", "anjali.nair@company.com", "Finance", "Financial Analyst"],
  ];

  for (const emp of employees) {
    insertEmployee.run(...emp);
  }

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, employee_id, due_date, priority) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tasks = [
    ["Fix login authentication bug", "Users cannot login with special characters in password", "in-progress", 1, "2025-02-01", "high"],
    ["Implement user dashboard", "Create main dashboard with key metrics", "pending", 1, "2025-02-15", "high"],
    ["Code review for API endpoints", "Review and approve new REST API endpoints", "completed", 1, "2025-01-20", "medium"],
    ["Create Q1 marketing campaign", "Design and launch Q1 digital marketing campaign", "in-progress", 2, "2025-02-28", "high"],
    ["Update social media content", "Refresh company social media profiles", "pending", 2, "2025-02-10", "low"],
    ["Write blog post on new features", "Technical blog post about latest product updates", "completed", 2, "2025-01-15", "medium"],
    ["Contact enterprise leads", "Follow up with potential enterprise clients", "in-progress", 3, "2025-02-05", "high"],
    ["Prepare sales presentation", "Create Q1 sales deck for team meeting", "pending", 3, "2025-02-20", "medium"],
    ["Update CRM records", "Clean and update customer database", "completed", 3, "2025-01-18", "low"],
    ["Conduct employee interviews", "Interview candidates for open positions", "in-progress", 4, "2025-02-08", "high"],
    ["Update employee handbook", "Review and update company policies", "pending", 4, "2025-03-01", "medium"],
    ["Plan team building event", "Organize quarterly team building activity", "completed", 4, "2025-01-25", "low"],
    ["Optimize database queries", "Improve performance of slow database operations", "pending", 5, "2025-02-12", "high"],
    ["Build responsive components", "Create mobile-responsive UI components", "in-progress", 5, "2025-02-18", "medium"],
    ["Fix CSS styling issues", "Resolve cross-browser compatibility problems", "completed", 5, "2025-01-22", "low"],
    ["Design new landing page", "Create mockups for product landing page", "in-progress", 6, "2025-02-14", "high"],
    ["Create icon set", "Design custom icons for the application", "pending", 6, "2025-02-25", "medium"],
    ["User research interviews", "Conduct UX research with target users", "completed", 6, "2025-01-28", "medium"],
    ["Write product requirements", "Document PRD for new feature release", "in-progress", 7, "2025-02-10", "high"],
    ["Analyze user feedback", "Review and categorize customer feedback", "pending", 7, "2025-02-22", "medium"],
    ["Roadmap planning session", "Plan product roadmap for Q2", "completed", 7, "2025-01-30", "high"],
    ["Prepare financial report", "Create monthly financial summary", "pending", 8, "2025-02-05", "high"],
    ["Budget analysis for Q1", "Analyze department budget allocations", "in-progress", 8, "2025-02-15", "medium"],
    ["Audit expense reports", "Review and approve team expenses", "completed", 8, "2025-01-20", "low"],
  ];

  for (const task of tasks) {
    insertTask.run(...task);
  }

  console.log("✅ Database seeded with sample data");
}
