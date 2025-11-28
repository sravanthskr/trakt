# Employee Task Tracker

A modern, responsive full-stack web application for managing employee tasks and workload efficiently. Built with React, Express.js, and SQLite.

**Live Demo:** https://trakt-i02x.onrender.com/

---

##  Project Overview

The Employee Task Tracker is an internal tool designed for HR managers and team leads to:
- Track employee task assignments and progress
- Monitor task statuses (pending, in-progress, completed)
- Set priorities and deadlines for tasks
- View employee workload and task distribution
- Get real-time dashboard statistics


---

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Shadcn UI** - High-quality component library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Express.js** - Web server framework
- **TypeScript** - Type-safe backend
- **better-sqlite3** - SQLite database driver
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation
- **compression** - Response compression middleware

### Database
- **SQLite** - Embedded, file-based database

---
## Screenshots
<img width="1892" height="905" alt="image" src="https://github.com/user-attachments/assets/4911b36e-a8b7-4072-b88d-1b5b1e4c3315" />

<img width="1904" height="908" alt="image" src="https://github.com/user-attachments/assets/24d8b6e3-8879-417d-b41c-a383e6b4c4d0" />

<img width="1900" height="899" alt="image" src="https://github.com/user-attachments/assets/306b05d9-0c85-4915-9259-b7961005e854" />


## Design & User Experience

### Design System
- **Theme:** Light mode only for optimal readability
- **Typography:** Inter font family with clean hierarchy
- **Spacing:** Consistent 2px, 4px, 8px, 16px scale

### Responsive Design
- **Mobile:** Full-width layout, optimized touch targets
- **Tablet:** 2-column layouts, condensed tables
- **Desktop:** Multi-column cards, expansive spacing

### Key Features
- Intuitive sidebar navigation with active route highlighting
- Real-time data updates with optimistic UI
- Loading states and error handling
- Success/error toast notifications

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control

### Installation

```bash
# Clone repository
git clone https://github.com/sravanthskr/trakt.git
cd trakt

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

---

## Project Structure

```
├── client/
│   └── src/
│       ├── pages/              # Page components (dashboard, employees, tasks)
│       ├── components/         # Reusable UI components
│       │   └── ui/            # Shadcn UI primitives
│       ├── lib/               # Utility functions and API client
│       ├── hooks/             # Custom React hooks
│       └── index.css          # Global styles and design system
├── server/
│   ├── database/              # Database setup and migrations
│   ├── routes.ts              # REST API endpoints
│   ├── storage.ts             # Database operations layer
│   └── index.ts               # Server entry point
├── shared/
│   └── schema.ts              # Shared types and Zod schemas
├── package.json               # Project dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

---

## API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get employee with tasks |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (supports filters) |
| GET | `/api/tasks/:id` | Get task details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get statistics (total tasks, completion rate) |

---

## Key Features Implemented

### Core Features
- Employee CRUD operations (Create, Read, Update, Delete)
- Task CRUD operations with employee assignment
- Task filtering by status and employee
- Dashboard with statistics and summaries
- Real-time data synchronization
- Form validation on frontend and backend
- Responsive design across all devices

### Code Quality
- Full TypeScript implementation for type safety
- Clean code architecture with separation of concerns
- Reusable components following DRY principle
- Consistent error handling throughout
- Proper HTTP status codes and error messages
- Input validation with Zod schemas

### Production Ready
- Gzip compression for faster delivery
- Environment-based configuration
- Silent logging in production mode
- Database auto-initialization and migrations
- Seed data with realistic names
- Zero configuration deployment
