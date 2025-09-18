import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  CreateTaskRequest,
  TaskDto,
  TaskFilter,
  UpdateTaskRequest,
} from '@turbovetnx/data';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  list(filter: TaskFilter): Observable<TaskDto[]> {
    let params = new HttpParams();
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.category) {
      params = params.set('category', filter.category);
    }
    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.priority) {
      params = params.set('priority', filter.priority);
    }
    return this.http.get<TaskDto[]>(this.baseUrl, { params });
  }

  create(request: CreateTaskRequest): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.baseUrl, request);
  }

  update(taskId: string, request: UpdateTaskRequest): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.baseUrl}/${taskId}`, request);
  }

  remove(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }
}
