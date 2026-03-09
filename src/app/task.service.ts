import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task, TaskPriority } from './task.model';

const STORAGE_KEY = 'gestor-tareas-data';

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Revisar correos electrónicos',
    description: 'Revisar y responder los correos pendientes del equipo.',
    date: '2026-03-08',
    priority: 'media',
    completed: false,
    createdAt: Date.now() - 100000,
  },
  {
    id: '2',
    title: 'Preparar presentación de diseño',
    description: 'Preparar slides para la reunión del cliente del viernes.',
    date: '2026-03-07',
    priority: 'alta',
    completed: true,
    createdAt: Date.now() - 200000,
  },
  {
    id: '3',
    title: 'Llamar al cliente',
    description: '',
    date: '2026-03-08',
    priority: 'baja',
    completed: false,
    createdAt: Date.now() - 50000,
  },
];

@Injectable({ providedIn: 'root' })
export class TaskService {
  private platformId = inject(PLATFORM_ID);

  tasks = signal<Task[]>(this.loadFromStorage());

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadFromStorage(): Task[] {
    if (!isPlatformBrowser(this.platformId)) return DEFAULT_TASKS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  }

  private persist() {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    } catch { }
  }

  addTask(title: string, description = '', date = '', priority: TaskPriority = 'media') {
    if (!title.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date: date || today,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    this.tasks.update(tasks => [newTask, ...tasks]);
    this.persist();
  }

  editTask(id: string, changes: Partial<Pick<Task, 'title' | 'description' | 'date' | 'priority'>>) {
    this.tasks.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, ...changes } : t))
    );
    this.persist();
  }

  toggleTask(id: string) {
    this.tasks.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    this.persist();
  }

  deleteTask(id: string) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.persist();
  }
}
