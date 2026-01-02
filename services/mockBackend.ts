import { User, Project, Task, TaskStatus, TaskPriority, UserRole } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
  USERS: 'avocado_users',
  PROJECTS: 'avocado_projects',
  TASKS: 'avocado_tasks',
  CURRENT_USER: 'avocado_current_user',
};

// Utilities
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial Data Seeding
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
};

seedData();

// --- Auth Services ---

export const loginUser = async (email: string): Promise<User> => {
  await delay(600); // Simulate network
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  let user = users.find((u) => u.email === email);
  
  // Simple role assignment for demo purposes
  const role: UserRole = email.toLowerCase().includes('client') ? 'CLIENT' : 'ADMIN';
  
  if (!user) {
    user = {
      id: generateId(),
      email,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=059669&color=fff`,
      role,
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } else {
    // Update role if logic changes (just for consistent demo behavior)
    user.role = role; 
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
};

export const logoutUser = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
};

// --- Project Services ---

export const getProjects = async (userId: string): Promise<Project[]> => {
  await delay(400);
  const projects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  // In this demo, we'll allow all users to see all projects for simplicity, 
  // or you could filter by access. Let's return all projects so clients can see them.
  return projects;
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
  await delay(500);
  const projects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: Date.now(),
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    await delay(300);
    let projects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    // Cascade delete tasks
    let tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    tasks = tasks.filter(t => t.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// --- Task Services ---

export const getTasks = async (projectId: string): Promise<Task[]> => {
  await delay(300);
  const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  return tasks.filter((t) => t.projectId === projectId);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  await delay(300);
  const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: Date.now(),
  };
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  // Optimistic UI updates often skip delay, but we'll keep it slight
  await delay(100); 
  const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) throw new Error('Task not found');
  
  tasks[index] = { ...tasks[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return tasks[index];
};

export const deleteTasks = async (taskIds: string[]): Promise<void> => {
    await delay(200);
    let tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    tasks = tasks.filter(t => !taskIds.includes(t.id));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}