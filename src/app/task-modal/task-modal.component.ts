import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskPriority } from '../task.model';

export interface TaskModalResult {
  title: string;
  description: string;
  date: string;
  priority: TaskPriority;
}

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (open) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        style="animation: fadeIn 0.18s ease both"
        (click)="onBackdropClick($event)">

        <!-- Panel -->
        <div
          class="modal-panel relative w-full max-w-md bg-[#130d1f] border border-white/10 rounded-2xl
                 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style="animation: slideUp 0.22s cubic-bezier(.22,1,.36,1) both"
          (click)="$event.stopPropagation()">

          <!-- Franja de color superior -->
          <div class="h-1 w-full bg-gradient-to-r from-primary via-[#ff7a33] to-[#f857a6]"></div>

          <!-- Cabecera -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-primary"
                    style="font-variation-settings:'FILL' 1">
                {{ isEdit ? 'edit_note' : 'add_task' }}
              </span>
              <h2 class="text-lg font-bold text-white">
                {{ isEdit ? 'Editar tarea' : 'Nueva tarea' }}
              </h2>
            </div>
            <button
              (click)="close()"
              class="size-9 flex items-center justify-center rounded-xl text-white/40
                     hover:text-white hover:bg-white/8 transition-all"
              aria-label="Cerrar modal">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Campos -->
          <div class="flex flex-col gap-4 px-6 py-5 overflow-y-auto max-h-[70vh]">

            <!-- Título -->
            <div class="flex flex-col gap-1.5">
              <label for="modal-title" class="text-xs font-bold text-white/50 uppercase tracking-wider">
                Título <span class="text-primary">*</span>
              </label>
              <input
                [(ngModel)]="formTitle"
                id="modal-title"
                type="text"
                placeholder="¿Qué necesitas hacer?"
                class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/25 transition-all
                       placeholder:text-white/25"
              />
            </div>

            <!-- Descripción -->
            <div class="flex flex-col gap-1.5">
              <label for="modal-desc" class="text-xs font-bold text-white/50 uppercase tracking-wider">
                Descripción
              </label>
              <textarea
                [(ngModel)]="formDescription"
                id="modal-desc"
                placeholder="Añade más detalles…"
                rows="3"
                class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/25 transition-all
                       placeholder:text-white/25 resize-none leading-relaxed">
              </textarea>
            </div>

            <div class="flex gap-3">
              <!-- Fecha -->
              <div class="flex-1 flex flex-col gap-1.5">
                <label for="modal-date" class="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">calendar_today</span> Fecha
                </label>
                <input
                  [(ngModel)]="formDate"
                  id="modal-date"
                  type="date"
                  class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white text-sm
                         focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/25 transition-all
                         [color-scheme:dark]"
                />
              </div>

              <!-- Prioridad -->
              <div class="flex-1 flex flex-col gap-1.5">
                <label for="modal-priority" class="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">flag</span> Prioridad
                </label>
                <select
                  [(ngModel)]="formPriority"
                  id="modal-priority"
                  class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white text-sm
                         focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/25 transition-all
                         [color-scheme:dark]">
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Pie de acciones -->
          <div class="flex gap-3 px-6 py-4 border-t border-white/8 bg-black/20">
            <button
              (click)="close()"
              class="flex-1 h-11 rounded-xl bg-white/6 hover:bg-white/10 text-white/60 hover:text-white
                     text-sm font-semibold transition-all">
              Cancelar
            </button>
            <button
              (click)="submit()"
              [disabled]="!formTitle.trim()"
              class="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-[#ff7a33] text-white font-bold
                     text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5
                     active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                     disabled:transform-none flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-base">save</span>
              {{ isEdit ? 'Guardar cambios' : 'Crear tarea' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
  `]
})
export class TaskModalComponent implements OnChanges {
  @Input() open = false;
  @Input() taskToEdit: Task | null = null;
  @Input() presetDate = ''; // fecha ISO pre-seleccionada desde el calendario

  @Output() save = new EventEmitter<TaskModalResult>();
  @Output() cancel = new EventEmitter<void>();

  get isEdit() { return this.taskToEdit !== null; }

  formTitle = '';
  formDescription = '';
  formDate = this.today();
  formPriority: TaskPriority = 'media';

  private today() {
    return new Date().toISOString().split('T')[0];
  }

  ngOnChanges(changes: SimpleChanges) {
    // Sincronizar formulario cada vez que se abre el modal
    if (changes['open']?.currentValue === true || changes['taskToEdit']) {
      if (this.taskToEdit) {
        this.formTitle = this.taskToEdit.title;
        this.formDescription = this.taskToEdit.description ?? '';
        this.formDate = this.taskToEdit.date;
        this.formPriority = this.taskToEdit.priority;
      } else {
        this.formTitle = '';
        this.formDescription = '';
        // Si viene del calendario, pre-carga la fecha del día seleccionado
        this.formDate = this.presetDate || this.today();
        this.formPriority = 'media';
      }
    }
  }

  submit() {
    if (!this.formTitle.trim()) return;
    this.save.emit({
      title: this.formTitle.trim(),
      description: this.formDescription.trim(),
      date: this.formDate,
      priority: this.formPriority,
    });
  }

  close() { this.cancel.emit(); }

  onBackdropClick(event: MouseEvent) {
    // Cerrar solo si el click fue en el backdrop (no en el panel)
    if (!(event.target as HTMLElement).closest('.modal-panel')) {
      this.close();
    }
  }
}
