import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../task.service';
import { TaskPriority } from '../task.model';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './new-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTaskComponent {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);

  today = new Date().toISOString().split('T')[0];

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    date: [this.today],
    priority: ['media' as TaskPriority],
  });

  saveTask() {
    if (this.taskForm.valid) {
      const { title, description, date, priority } = this.taskForm.value;
      this.taskService.addTask(
        title!,
        description ?? '',
        date ?? this.today,
        (priority as TaskPriority) ?? 'media'
      );
      this.router.navigate(['/']);
    }
  }
}
