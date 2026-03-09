import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TaskService } from '../task.service';
import { Task, TaskFilter, TaskPriority } from '../task.model';
import { TaskModalComponent, TaskModalResult } from '../task-modal/task-modal.component';
import { CalendarComponent } from '../calendar/calendar.component';

type AppView = 'list' | 'calendar';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskModalComponent, CalendarComponent],
  templateUrl: './task-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  // Vista activa
  view = signal<AppView>('list');

  // Filtro de la lista
  filter = signal<TaskFilter>('Todas');

  // Estado del modal
  modalOpen = signal(false);
  taskToEdit = signal<Task | null>(null);
  // Fecha pre-seleccionada para nueva tarea (desde calendario)
  presetDate = signal<string>('');

  // Contadores
  totalTasks = computed(() => this.taskService.tasks().length);
  pendingCount = computed(() => this.taskService.tasks().filter(t => !t.completed).length);
  completedCount = computed(() => this.taskService.tasks().filter(t => t.completed).length);

  filteredTasks = computed(() => {
    const tasks = this.taskService.tasks();
    const f = this.filter();
    if (f === 'Pendientes') return tasks.filter(t => !t.completed);
    if (f === 'Completadas') return tasks.filter(t => t.completed);
    return tasks;
  });

  setView(v: AppView) { this.view.set(v); }
  setFilter(f: TaskFilter) { this.filter.set(f); }

  // Abrir modal para CREAR (con fecha opcional)
  openCreate(date = '') {
    this.taskToEdit.set(null);
    this.presetDate.set(date);
    this.modalOpen.set(true);
  }

  // Abrir modal para EDITAR
  openEdit(task: Task) {
    this.taskToEdit.set(task);
    this.presetDate.set('');
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.taskToEdit.set(null);
    this.presetDate.set('');
  }

  onModalSave(result: TaskModalResult) {
    const editing = this.taskToEdit();
    if (editing) {
      this.taskService.editTask(editing.id, result);
    } else {
      this.taskService.addTask(result.title, result.description, result.date, result.priority);
    }
    this.closeModal();
  }

  // Desde calendario: crear tarea en fecha específica
  onAddTaskForDay(dateIso: string) {
    this.presetDate.set(dateIso);
    this.openCreate(dateIso);
  }

  toggleTask(id: string) { this.taskService.toggleTask(id); }
  deleteTask(id: string) { this.taskService.deleteTask(id); }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return dateStr; }
  }

  priorityLabel(p: TaskPriority) {
    return { baja: 'Baja', media: 'Media', alta: 'Alta' }[p];
  }

  priorityColor(p: TaskPriority) {
    return {
      baja: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      media: 'text-amber-400  bg-amber-400/10  border-amber-400/30',
      alta: 'text-red-400    bg-red-400/10    border-red-400/30',
    }[p];
  }
}
