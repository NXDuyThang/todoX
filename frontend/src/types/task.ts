export type TaskStatus = 'pending' | 'completed';

export type Task = {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetTasksResponse = {
  message: string;
  tasks: Task[];
};

export type CreateTaskResponse = {
  message: string;
  task: Task;
};

export type UpdateTaskResponse = {
  message: string;
  task: Task;
};

export type DeleteTaskResponse = {
  meesage?: string; // backend typo
  message?: string;
  task: Task | null;
};

