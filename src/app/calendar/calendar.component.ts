import {
    Component,
    inject,
    signal,
    computed,
    ChangeDetectionStrategy,
    Output,
    EventEmitter,
} from '@angular/core';
import { TaskService } from '../task.service';
import { Task, TaskPriority } from '../task.model';

export interface CalendarDay {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: Task[];
}

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css',
})
export class CalendarComponent {
    private taskService = inject(TaskService);

    @Output() addTaskForDay = new EventEmitter<string>(); // emite fecha ISO YYYY-MM-DD

    weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    currentYear = signal(new Date().getFullYear());
    currentMonth = signal(new Date().getMonth()); // 0-indexed
    selectedDay = signal<CalendarDay | null>(null);

    monthTitle = computed(() =>
        new Date(this.currentYear(), this.currentMonth(), 1)
            .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    );

    // Agrupar tareas por fecha ISO (YYYY-MM-DD)
    tasksByDate = computed(() => {
        const map = new Map<string, Task[]>();
        for (const task of this.taskService.tasks()) {
            if (!task.date) continue;
            if (!map.has(task.date)) map.set(task.date, []);
            map.get(task.date)!.push(task);
        }
        return map;
    });

    calendarDays = computed((): CalendarDay[] => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstOfMonth = new Date(year, month, 1);
        let startOffset = firstOfMonth.getDay() - 1; // semana empieza en lunes
        if (startOffset < 0) startOffset = 6;

        const days: CalendarDay[] = [];
        const map = this.tasksByDate();

        // Días del mes anterior
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            d.setHours(0, 0, 0, 0);
            const key = this.toDateKey(d);
            days.push({ date: d, dateKey: key, isCurrentMonth: false, isToday: false, tasks: map.get(key) ?? [] });
        }

        // Días del mes actual
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            d.setHours(0, 0, 0, 0);
            const key = this.toDateKey(d);
            days.push({
                date: d, dateKey: key,
                isCurrentMonth: true,
                isToday: d.getTime() === today.getTime(),
                tasks: map.get(key) ?? [],
            });
        }

        // Días del mes siguiente para completar fila
        const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            d.setHours(0, 0, 0, 0);
            const key = this.toDateKey(d);
            days.push({ date: d, dateKey: key, isCurrentMonth: false, isToday: false, tasks: map.get(key) ?? [] });
        }

        return days;
    });

    // Navegar meses
    prevMonth() {
        this.clearSelection();
        const m = this.currentMonth();
        if (m === 0) { this.currentMonth.set(11); this.currentYear.update(y => y - 1); }
        else { this.currentMonth.update(v => v - 1); }
    }

    nextMonth() {
        this.clearSelection();
        const m = this.currentMonth();
        if (m === 11) { this.currentMonth.set(0); this.currentYear.update(y => y + 1); }
        else { this.currentMonth.update(v => v + 1); }
    }

    // Selección de día
    selectDay(day: CalendarDay) {
        if (day.tasks.length === 0) return;
        const sel = this.selectedDay();
        if (sel && sel.dateKey === day.dateKey) {
            this.clearSelection();
        } else {
            this.selectedDay.set(day);
        }
    }

    clearSelection() { this.selectedDay.set(null); }

    isSelected(day: CalendarDay): boolean {
        const sel = this.selectedDay();
        return sel !== null && sel.dateKey === day.dateKey;
    }

    isNotSelected(day: CalendarDay): boolean {
        return !this.isSelected(day);
    }

    onAddTaskForDay(date: Date) {
        this.addTaskForDay.emit(this.toDateKey(date));
    }

    // ── Clases de estilos ──────────────────────────────────────

    getDayClass(day: CalendarDay): string {
        if (this.isSelected(day)) return 'selected-day';
        if (day.isToday && day.tasks.length > 0) return 'today-with-tasks';
        if (day.isToday) return 'today-day';
        if (day.tasks.length > 0) return 'has-tasks-day';
        return 'empty-day';
    }

    getDayNumberClass(day: CalendarDay): string {
        if (this.isSelected(day)) return 'text-white';
        if (day.isToday) return 'text-primary font-bold';
        if (!day.isCurrentMonth) return 'text-white/20';
        if (day.tasks.length > 0) return 'text-white';
        return 'text-white/40';
    }

    getPriorityDot(p: TaskPriority): string {
        const map: Record<TaskPriority, string> = {
            baja: 'dot-baja', media: 'dot-media', alta: 'dot-alta'
        };
        return map[p];
    }

    getPriorityBadge(p: TaskPriority): string {
        const map: Record<TaskPriority, string> = {
            baja: 'badge-baja',
            media: 'badge-media',
            alta: 'badge-alta',
        };
        return map[p];
    }

    getCountBadgeClass(tasks: Task[]): string {
        if (tasks.some(t => t.priority === 'alta')) return 'badge-count-alta';
        if (tasks.some(t => t.priority === 'media')) return 'badge-count-media';
        return 'badge-count-baja';
    }

    priorityLabel(p: TaskPriority) {
        return { baja: 'Baja', media: 'Media', alta: 'Alta' }[p];
    }

    selectedDayLabel(): string {
        const d = this.selectedDay();
        if (!d) return '';
        return d.date.toLocaleDateString('es-ES', { weekday: 'long' });
    }

    selectedDayFull(): string {
        const d = this.selectedDay();
        if (!d) return '';
        return d.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    selectedTaskCount(): number {
        return this.selectedDay()?.tasks.length ?? 0;
    }

    selectedTasks(): Task[] {
        return this.selectedDay()?.tasks ?? [];
    }

    selectedDate(): Date {
        return this.selectedDay()!.date;
    }

    private toDateKey(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
}
