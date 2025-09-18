import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import {
  selectTaskSummary,
  selectTasksByStatus,
  selectTasksLoading,
} from '../../state/tasks/tasks.selectors';
import { TasksActions } from '../../state/tasks/tasks.actions';
import {
  AuditAction,
  AuditLogEntry,
  TaskDto,
  TaskFilter,
  TaskPriority,
  TaskStatus,
  CreateTaskRequest,
} from '@turbovetnx/data';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { OrganizationsApiService } from '../../core/api/organizations-api.service';
import { AuditApiService } from '../../core/api/audit-api.service';
import { OrganizationDto } from '@turbovetnx/data';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { merge, of } from 'rxjs';
import { selectAllTasks } from '../../state/tasks/tasks.reducer';
import { AuthActions } from '../../state/auth/auth.actions';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly auditApi = inject(AuditApiService);

  protected readonly TaskStatus = TaskStatus;
  protected readonly TaskPriority = TaskPriority;

  protected readonly user = toSignal(this.store.select(selectAuthUser), {
    initialValue: null,
  });
  protected readonly tasksByStatus = toSignal(
    this.store.select(selectTasksByStatus),
    { initialValue: {
      [TaskStatus.Backlog]: [],
      [TaskStatus.InProgress]: [],
      [TaskStatus.Blocked]: [],
      [TaskStatus.Completed]: [],
    } },
  );
  protected readonly loading = toSignal(this.store.select(selectTasksLoading), {
    initialValue: false,
  });

  protected readonly summary = toSignal(
    this.store.select(selectTaskSummary),
    {
      initialValue: {
        total: 0,
        completed: 0,
        highPriority: 0,
        contributors: 0,
      },
    },
  );

  protected readonly categories = toSignal(
    this.store.select(selectAllTasks).pipe(
      map((tasks) => Array.from(new Set(tasks.map((task) => task.category).filter(Boolean)))),
    ),
    { initialValue: [] as string[] },
  );

  protected readonly activeTab = signal<'tasks' | 'audit'>('tasks');
  protected readonly auditEntries = signal<AuditLogEntry[]>([]);
  protected readonly auditLoading = signal(false);
  protected readonly auditError = signal<string | null>(null);

  protected readonly statusColumns: Array<{
    status: TaskStatus;
    title: string;
    description: string;
  }> = [
    {
      status: TaskStatus.Backlog,
      title: 'To Do',
      description: 'Incoming items ready to be picked up.',
    },
    {
      status: TaskStatus.InProgress,
      title: 'In Progress',
      description: 'Active execution by assigned agents.',
    },
    {
      status: TaskStatus.Blocked,
      title: 'Blocked',
      description: 'Requires intervention to proceed.',
    },
    {
      status: TaskStatus.Completed,
      title: 'Completed',
      description: 'Verified and closed tasks.',
    },
  ];

  protected readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    category: [''],
    status: [TaskStatus.Backlog as TaskStatus, Validators.required],
    priority: [TaskPriority.Medium as TaskPriority, Validators.required],
    organizationId: ['', Validators.required],
    assigneeId: [''],
    dueDate: [''],
  });

  protected readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    category: [''],
    search: [''],
    priority: [''],
  });

  protected readonly organizations = signal<OrganizationDto[]>([]);
  protected readonly isCreateDialogOpen = signal(false);

  protected readonly brandInitials = computed(() => {
    const displayName = this.user()?.displayName || this.user()?.email || 'TM';
    const initials = displayName
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
    return initials.padEnd(2, 'M');
  });

  protected readonly organizationLabel = computed(
    () => this.user()?.organizationPath || 'TurboVets',
  );

  protected readonly statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'To Do', value: TaskStatus.Backlog },
    { label: 'In Progress', value: TaskStatus.InProgress },
    { label: 'Blocked', value: TaskStatus.Blocked },
    { label: 'Completed', value: TaskStatus.Completed },
  ];

  protected readonly priorityOptions = [
    { label: 'All Priority', value: '' },
    { label: 'High', value: TaskPriority.High },
    { label: 'Medium', value: TaskPriority.Medium },
    { label: 'Low', value: TaskPriority.Low },
  ];

  protected readonly auditActionMeta: Record<AuditAction, { label: string; chipClass: string }> = {
    [AuditAction.TaskCreate]: {
      label: 'Created task',
      chipClass: 'bg-primary-100 text-primary-700',
    },
    [AuditAction.TaskUpdate]: {
      label: 'Updated task',
      chipClass: 'bg-amber-100 text-amber-700',
    },
    [AuditAction.TaskDelete]: {
      label: 'Deleted task',
      chipClass: 'bg-rose-100 text-rose-700',
    },
    [AuditAction.TaskView]: {
      label: 'Viewed task',
      chipClass: 'bg-slate-100 text-slate-700',
    },
    [AuditAction.Login]: {
      label: 'Login',
      chipClass: 'bg-emerald-100 text-emerald-700',
    },
    [AuditAction.Logout]: {
      label: 'Logout',
      chipClass: 'bg-slate-100 text-slate-700',
    },
  };

  ngOnInit(): void {
    this.loadOrganizations();
    this.bindFilters();
  }

  private loadOrganizations(): void {
    this.organizationsApi.list().subscribe({
      next: (orgs) => {
        this.organizations.set(orgs);
        if (!this.createForm.value.organizationId && orgs.length > 0) {
          this.createForm.patchValue({ organizationId: orgs[0].id });
        }
      },
      error: () => {
        this.organizations.set([]);
      },
    });
  }

  private bindFilters(): void {
    merge(
      of(this.filterForm.getRawValue()),
      this.filterForm.valueChanges.pipe(
        debounceTime(250),
        distinctUntilChanged(
          (previous, current) =>
            previous.status === current.status &&
            previous.category === current.category &&
            previous.search === current.search &&
            previous.priority === current.priority,
        ),
      ),
    )
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const filter: TaskFilter = {
          status: value.status ? (value.status as TaskStatus) : undefined,
          category: value.category || undefined,
          search: value.search || undefined,
          priority: value.priority ? (value.priority as TaskPriority) : undefined,
        };
        this.store.dispatch(TasksActions.setFilters({ filter }));
        this.store.dispatch(TasksActions.loadTasks({ filter }));
      });
  }

  protected openCreateDialog(): void {
    this.isCreateDialogOpen.set(true);
  }

  protected closeCreateDialog(): void {
    this.isCreateDialogOpen.set(false);
    this.createForm.reset({
      title: '',
      description: '',
      category: '',
      status: TaskStatus.Backlog,
      priority: TaskPriority.Medium,
      organizationId: this.organizations().at(0)?.id ?? '',
      assigneeId: '',
      dueDate: '',
    });
  }

  protected createTask(): void {
    if (this.createForm.invalid || !this.user()) {
      this.createForm.markAllAsTouched();
      return;
    }
    const values = this.createForm.getRawValue();
    const request: CreateTaskRequest = {
      title: values.title,
      description: values.description || undefined,
      category: values.category || 'General',
      status: values.status,
      priority: values.priority,
      organizationId: values.organizationId,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
    };
    this.store.dispatch(TasksActions.createTask({ request }));
    this.closeCreateDialog();
  }

  protected drop(event: CdkDragDrop<TaskDto[]>, nextStatus: TaskStatus): void {
    const task = event.item.data as TaskDto;
    if (task.status === nextStatus) {
      return;
    }
    this.store.dispatch(
      TasksActions.updateTask({ taskId: task.id, changes: { status: nextStatus } }),
    );
  }

  protected logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  protected switchTab(tab: 'tasks' | 'audit'): void {
    if (this.activeTab() === tab) {
      return;
    }
    this.activeTab.set(tab);
    if (tab === 'audit' && !this.auditEntries().length) {
      this.loadAuditLog();
    }
  }

  protected auditLabel(entry: AuditLogEntry): string {
    return this.auditActionMeta[entry.action]?.label ?? 'Activity';
  }

  protected auditChipClass(entry: AuditLogEntry): string {
    return this.auditActionMeta[entry.action]?.chipClass ?? 'bg-slate-100 text-slate-700';
  }

  protected actorInitials(entry: AuditLogEntry): string {
    return entry.actorId.slice(0, 2).toUpperCase();
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  protected auditMetadata(entry: AuditLogEntry): string {
    const metadata = entry.metadata as Record<string, unknown> | undefined;
    if (!metadata) {
      return '';
    }
    const preferredKeys = ['message', 'status', 'title', 'description'];
    for (const key of preferredKeys) {
      const value = metadata[key];
      if (value) {
        return String(value);
      }
    }
    const fallback = Object.values(metadata)[0];
    return fallback ? String(fallback) : '';
  }

  private loadAuditLog(): void {
    this.auditLoading.set(true);
    this.auditError.set(null);
    this.auditApi.list(25).subscribe({
      next: (entries) => {
        this.auditEntries.set(entries);
        this.auditLoading.set(false);
      },
      error: () => {
        this.auditError.set('Failed to fetch audit log.');
        this.auditLoading.set(false);
      },
    });
  }
}
