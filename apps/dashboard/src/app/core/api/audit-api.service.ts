import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuditLogEntry } from '@turbovetnx/data';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/audit-log';

  list(limit = 25): Observable<AuditLogEntry[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<AuditLogEntry[]>(this.baseUrl, { params });
  }
}
