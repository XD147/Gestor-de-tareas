export type TaskPriority = 'baja' | 'media' | 'alta';
export type TaskFilter = 'Todas' | 'Pendientes' | 'Completadas';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: number;
}
