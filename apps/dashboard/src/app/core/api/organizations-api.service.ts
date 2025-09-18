import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationDto } from '@turbovetnx/data';

@Injectable({ providedIn: 'root' })
export class OrganizationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/organizations';

  list(): Observable<OrganizationDto[]> {
    return this.http.get<OrganizationDto[]>(this.baseUrl);
  }
}
