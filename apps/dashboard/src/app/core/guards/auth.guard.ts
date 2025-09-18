import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../state/auth/auth.selectors';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuthed) =>
        isAuthed
          ? true
          : this.router.createUrlTree(['/login'], {
              queryParams: { returnUrl: state.url },
            }),
      ),
    );
  }
}
