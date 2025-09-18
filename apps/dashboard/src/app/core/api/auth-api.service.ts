import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthPayload } from '@turbovetnx/data';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  login(body: LoginRequest): Observable<AuthPayload> {
    return this.http.post<AuthPayload>(`${this.baseUrl}/login`, body);
  }

  profile(): Observable<AuthPayload['user']> {
    return this.http.get<AuthPayload['user']>(`${this.baseUrl}/me`);
  }
}
