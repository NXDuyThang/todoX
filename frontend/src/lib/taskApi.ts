import { http } from './http';
import type {
  CreateTaskResponse,
  DeleteTaskResponse,
  GetTasksResponse,
  Task,
  TaskStatus,
  UpdateTaskResponse,
} from '../types/task';

function normalizeTask(t: Task): Task {
  // Tránh case backend trả `id` thay vì `_id` (hoặc `_id` bị mất)
  const anyT = t as unknown as { _id?: string; id?: string };
  const id = anyT._id ?? anyT.id;
  if (!id) return t;
  return { ...t, _id: id };
}

export async function getTasks(signal?: AbortSignal): Promise<Task[]> {
  const res = await http<GetTasksResponse>('/api/tasks', { signal });
  return res.tasks.map(normalizeTask);
}

export async function createTask(input: {
  title: string;
  description: string;
}): Promise<Task> {
  const res = await http<CreateTaskResponse>('/api/tasks', {
    method: 'POST',
    body: input,
  });
  return normalizeTask(res.task);
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    completedAt: string | null;
  }>,
): Promise<Task> {
  const res = await http<UpdateTaskResponse>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: input,
  });
  return normalizeTask(res.task);
}

export async function deleteTask(id: string): Promise<void> {
  await http<DeleteTaskResponse>(`/api/tasks/${id}`, { method: 'DELETE' });
}

