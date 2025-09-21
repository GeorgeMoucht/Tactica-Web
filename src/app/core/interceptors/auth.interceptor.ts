import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Attach Authorization only for our API
  const isApi = req.url.includes('/api/');
  const token = auth.token();
  const type = auth.tokenType();

  if (isApi && token) {
    req = req.clone({ setHeaders: { Authorization: `${type} ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Try refresh on 401 if we have a refresh token
      if (isApi && err.status === 401) {
        const rt = auth.refreshToken();
        if (rt && !refreshing) {
          refreshing = true;
          return auth.refresh(rt).pipe(
            switchMap((p) => {
              refreshing = false;
              if (p.access_token) {
                auth.setSession({ access_token: p.access_token, refresh_token: p.refresh_token, token_type: p.token_type || 'Bearer' });
                const retry = req.clone({ setHeaders: { Authorization: `${auth.tokenType()} ${auth.token()}` } });
                return next(retry);
              }
              auth.clearSession();
              return throwError(() => err);
            }),
            catchError(e => {
              refreshing = false;
              auth.clearSession();
              return throwError(() => e);
            })
          );
        }
        auth.clearSession();
      }
      return throwError(() => err);
    })
  );
};
