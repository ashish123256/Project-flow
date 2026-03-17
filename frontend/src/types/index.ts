// ── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Login / register now return token in body + set httpOnly cookie
export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Project ───────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'completed';

export interface Project {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {}

export interface ProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
}

// ── Task ──────────────────────────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  project: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface TasksResponse {
  tasks: Task[];
  counts: TaskCounts;
}

export interface TaskCounts {
  todo: number;
  'in-progress': number;
  done: number;
  total: number;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskQueryParams {
  status?: TaskStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}
