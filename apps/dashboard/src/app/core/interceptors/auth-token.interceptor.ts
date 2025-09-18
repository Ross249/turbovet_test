import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStorageService } from '../services/auth-storage.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(AuthStorageService);
  const session = storage.load();
  if (session?.token) {
    const authorized = request.clone({
      setHeaders: { Authorization: `Bearer ${session.token}` },
    });
    return next(authorized);
  }
  return next(request);
};
