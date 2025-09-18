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
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    CdkDropList,
    CdkDrag,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    CardModule,
    ChipModule,
    TagModule,
    TabsModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    FloatLabelModule,
    TextareaModule,
    DatePickerModule,
    MessageModule,
    PanelModule,
    InputIconModule,
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

  protected readonly categoryFilterOptions = computed(() => [
    { label: 'All Categories', value: '' },
    ...this.categories().map((category) => ({ label: category, value: category })),
  ]);

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

  protected readonly createForm = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.fb.control(''),
    category: this.fb.control(''),
    status: this.fb.nonNullable.control<TaskStatus>(TaskStatus.Backlog, Validators.required),
    priority: this.fb.nonNullable.control<TaskPriority>(TaskPriority.Medium, Validators.required),
    organizationId: this.fb.nonNullable.control('', Validators.required),
    assigneeId: this.fb.control(''),
    dueDate: this.fb.control<Date | null>(null),
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

  protected readonly statusFilterOptions = [
    { label: 'All Status', value: '' },
    { label: 'To Do', value: TaskStatus.Backlog },
    { label: 'In Progress', value: TaskStatus.InProgress },
    { label: 'Blocked', value: TaskStatus.Blocked },
    { label: 'Completed', value: TaskStatus.Completed },
  ];

  protected readonly priorityFilterOptions = [
    { label: 'All Priority', value: '' },
    { label: 'High', value: TaskPriority.High },
    { label: 'Medium', value: TaskPriority.Medium },
    { label: 'Low', value: TaskPriority.Low },
  ];

  protected readonly prioritySelectOptions = [
    { label: 'High', value: TaskPriority.High },
    { label: 'Medium', value: TaskPriority.Medium },
    { label: 'Low', value: TaskPriority.Low },
  ];

  protected readonly auditActionMeta: Record<AuditAction, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
    [AuditAction.TaskCreate]: {
      label: 'Created task',
      severity: 'success',
    },
    [AuditAction.TaskUpdate]: {
      label: 'Updated task',
      severity: 'info',
    },
    [AuditAction.TaskDelete]: {
      label: 'Deleted task',
      severity: 'danger',
    },
    [AuditAction.TaskView]: {
      label: 'Viewed task',
      severity: 'info',
    },
    [AuditAction.Login]: {
      label: 'Login',
      severity: 'success',
    },
    [AuditAction.Logout]: {
      label: 'Logout',
      severity: 'info',
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
      dueDate: null,
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
      dueDate:
        values.dueDate instanceof Date
          ? values.dueDate.toISOString()
          : values.dueDate || undefined,
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

  protected switchTab(tab: 'tasks' | 'audit' | string | number): void {
    const next = tab === 'audit' ? 'audit' : tab === 'tasks' ? 'tasks' : undefined;
    if (!next) {
      return;
    }
    if (this.activeTab() === next) {
      return;
    }
    this.activeTab.set(next);
    if (next === 'audit' && !this.auditEntries().length) {
      this.loadAuditLog();
    }
  }

  protected auditLabel(entry: AuditLogEntry): string {
    return this.auditActionMeta[entry.action]?.label ?? 'Activity';
  }

  protected auditSeverity(entry: AuditLogEntry): 'success' | 'info' | 'warning' | 'danger' {
    return this.auditActionMeta[entry.action]?.severity ?? 'info';
  }

  protected actorInitials(entry: AuditLogEntry): string {
    return entry.actorId.slice(0, 2).toUpperCase();
  }

  protected prioritySeverity(priority: TaskPriority): 'success' | 'info' | 'warning' | 'danger' {
    switch (priority) {
      case TaskPriority.Low:
        return 'success';
      case TaskPriority.Medium:
        return 'warning';
      case TaskPriority.High:
        return 'danger';
      default:
        return 'info';
    }
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
