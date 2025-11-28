const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
    });
    return handleResponse<T>(response);
  },
};

export const employeeService = {
  getAll: () => api.get("/employees"),
  getById: (id: number) => api.get(`/employees/${id}`),
  create: (data: unknown) => api.post("/employees", data),
  update: (id: number, data: unknown) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

export const taskService = {
  getAll: (filters?: { status?: string; employeeId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.employeeId) params.append("employee_id", String(filters.employeeId));
    const query = params.toString();
    return api.get(`/tasks${query ? `?${query}` : ""}`);
  },
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: unknown) => api.post("/tasks", data),
  update: (id: number, data: unknown) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const dashboardService = {
  getStats: () => api.get("/dashboard"),
};
